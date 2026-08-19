import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertTriangle,
    CalendarDays,
    Check,
    Clock,
    Clock3,
    PawPrint,
    Scissors,
    WandSparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { aiPreviewApi, appointmentsApi, getErrorMessage, petsApi } from '../utils/api'
import { getPhilippineSeason } from '../utils/season'
import {
    SOURCE_PHOTO_POLICY_VERSION,
    createPreviewCacheKey,
    getCachedPreview,
    hashFile,
    saveCachedPreview
} from '../utils/previewCache'
import AvailabilityCalendar from '../features/booking/components/AvailabilityCalendar'
import TimeSlotGrid from '../features/booking/components/TimeSlotGrid'
import AiPreviewPanel from '../features/booking/components/AiPreviewPanel'
import StylePicker from '../features/booking/components/StylePicker'
import {
    addDays,
    formatDateLong,
    formatTimeRange,
    toDateKey,
    toMonthKey
} from '../features/booking/utils/dateTime'
import { getActivePetId } from '../features/booking/utils/petContext'
import {
    getAutomaticPreviewStyles,
    getNextFailedStyleId
} from '../features/booking/utils/galleryPolicy'

const fallbackServices = [
    { id: 'basic-grooming', name: 'Basic Grooming', description: 'Bath, brush, nail trim, ear cleaning, and blow dry.', durationMinutes: 60, price: 500, supportsAiPreview: false },
    { id: 'full-grooming', name: 'Full Grooming', description: 'Basic grooming plus a complete haircut and styling.', durationMinutes: 120, price: 1200, supportsAiPreview: true },
    { id: 'custom-styling', name: 'Custom Styling', description: 'A style-focused grooming session based on the selected haircut.', durationMinutes: 90, price: 1000, supportsAiPreview: true },
    { id: 'bath-blow-dry', name: 'Bath & Blow Dry', description: 'Deep cleanse, conditioner, and professional blow dry.', durationMinutes: 90, price: 800, supportsAiPreview: false },
    { id: 'nail-trimming', name: 'Nail Trimming', description: 'Safe and careful nail clipping.', durationMinutes: 30, price: 200, supportsAiPreview: false },
    { id: 'ear-cleaning', name: 'Ear Cleaning', description: 'Gentle external ear hygiene service.', durationMinutes: 30, price: 250, supportsAiPreview: false }
]

const emptyPet = {
    name: '',
    type: 'dog',
    breed: '',
    coatType: '',
    notes: ''
}


// The frontend displays only these fixed two-hour booking periods.
// The backend must enforce the same periods before saving.
const FIXED_BOOKING_SLOTS = [
    { startTime: '08:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '16:00' }
]

const timeToMinutes = (time) => {
    const [hours, minutes] = String(time || '')
        .split(':')
        .map(Number)

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null
    }

    return hours * 60 + minutes
}

const rangesOverlap = (first, second) => {
    const firstStart = timeToMinutes(first.startTime)
    const firstEnd = timeToMinutes(first.endTime)
    const secondStart = timeToMinutes(second.startTime)
    const secondEnd = timeToMinutes(second.endTime)

    if (
        firstStart === null ||
        firstEnd === null ||
        secondStart === null ||
        secondEnd === null
    ) {
        return false
    }

    return firstStart < secondEnd && firstEnd > secondStart
}

const normalizeFixedSlots = (apiSlots = []) =>
    FIXED_BOOKING_SLOTS.map((fixedSlot) => {
        const exactSlot = apiSlots.find(
            (slot) =>
                slot.startTime === fixedSlot.startTime &&
                slot.endTime === fixedSlot.endTime
        )

        if (exactSlot) {
            return {
                ...fixedSlot,
                ...exactSlot
            }
        }

        const overlappingSlots = apiSlots.filter((slot) =>
            rangesOverlap(fixedSlot, slot)
        )

        const hasBookedConflict = overlappingSlots.some((slot) =>
            ['booked', 'unavailable', 'closed'].includes(slot.status)
        )

        const isPast = overlappingSlots.some(
            (slot) => slot.status === 'past'
        )

        return {
            ...fixedSlot,
            status: isPast
                ? 'past'
                : hasBookedConflict
                    ? 'booked'
                    : 'available'
        }
    })

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(
        new Error('Unable to read the selected image')
    )
    reader.readAsDataURL(file)
})

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const runStyleQueue = async (items, worker) => {
    for (let i = 0; i < items.length; i += 1) {
        if (i > 0) {
            await delay(1500)
        }
        const result = await worker(items[i])

        if (result?.stopQueue) return result
    }

    return { stopQueue: false }
}

export default function Booking() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const season = getPhilippineSeason()
    const today = useMemo(() => new Date(), [])
    const minDate = useMemo(() => toDateKey(today), [today])
    const maxDate = useMemo(() => toDateKey(addDays(today, 90)), [today])

    const [services, setServices] = useState(fallbackServices)
    const [styles, setStyles] = useState([])
    const [stylesLoading, setStylesLoading] = useState(false)
    const [previewVersion, setPreviewVersion] = useState('')
    const [recommendations, setRecommendations] = useState([])
    const [recommendationsLoading, setRecommendationsLoading] = useState(false)
    const [recommendationsReady, setRecommendationsReady] = useState(false)
    const [pets, setPets] = useState([])
    const [petMode, setPetMode] = useState('existing')
    const [selectedPetId, setSelectedPetId] = useState('')
    const [newPet, setNewPet] = useState(emptyPet)
    const [selectedServiceId, setSelectedServiceId] = useState('')
    const [selectedStyleId, setSelectedStyleId] = useState('')
    const [photoDataUrl, setPhotoDataUrl] = useState('')
    const [photoPreview, setPhotoPreview] = useState('')
    const [stylePreviews, setStylePreviews] = useState({})
    const [generatedPreview, setGeneratedPreview] = useState('')
    const [generatedPreviewMeta, setGeneratedPreviewMeta] = useState(null)
    const [previewFromCache, setPreviewFromCache] = useState(false)
    const [photoHash, setPhotoHash] = useState('')
    const [consent, setConsent] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState('idle')
    const [galleryGenerating, setGalleryGenerating] = useState(false)
    const [galleryMessage, setGalleryMessage] = useState('')
    const [monthKey, setMonthKey] = useState(toMonthKey(today))
    const [monthStatuses, setMonthStatuses] = useState({})
    const [calendarLoading, setCalendarLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [slots, setSlots] = useState([])
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [selectedTime, setSelectedTime] = useState('')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [booked, setBooked] = useState(null)
    const galleryRunIdRef = useRef(0)
    const galleryBusyRef = useRef(false)
    const startedGalleryKeyRef = useRef('')
    const photoVerificationTokenRef = useRef('')

    const selectedService = services.find((service) => service.id === selectedServiceId)
    const selectedPet = pets.find((pet) => pet._id === selectedPetId)
    const activePet = petMode === 'existing' ? selectedPet : newPet
    const activePetId = getActivePetId(petMode, selectedPet)
    const activePetType = String(activePet?.type || '').toLowerCase()
    const compatibleStyles = styles.filter((style) =>
        Array.isArray(style.petTypes) &&
        style.petTypes.includes(activePetType)
    )
    const selectedStyle = compatibleStyles.find((style) => style.id === selectedStyleId)
    const selectedSlot = slots.find((slot) => slot.startTime === selectedTime)
    const aiEnabled = Boolean(selectedService?.supportsAiPreview)

    useEffect(() => {
        Promise.allSettled([
            appointmentsApi.getServices(),
            petsApi.getMine()
        ]).then(([servicesResult, petsResult]) => {
            if (servicesResult.status === 'fulfilled' && servicesResult.value.data?.services?.length) {
                setServices(servicesResult.value.data.services)
            }
            if (petsResult.status === 'fulfilled') {
                const loadedPets = petsResult.value.data?.pets || []
                setPets(loadedPets)
                if (loadedPets.length) setSelectedPetId(loadedPets[0]._id)
                else setPetMode('new')
            }
        })
    }, [])

    useEffect(() => {
        const petType = String(
            activePet?.type || ''
        ).toLowerCase()

        if (!['dog', 'cat'].includes(petType)) {
            return
        }

        let active = true
        queueMicrotask(() => {
            if (active) setStylesLoading(true)
        })

        aiPreviewApi.getStyles(petType)
            .then(({ data }) => {
                if (!active) return
                setStyles(data.styles || [])
                setPreviewVersion(
                    data.previewVersion || 'default'
                )
            })
            .catch((error) => {
                if (!active) return
                setStyles([])
                toast.error(getErrorMessage(error))
            })
            .finally(() => {
                if (active) setStylesLoading(false)
            })

        return () => {
            active = false
        }
    }, [activePet?.type])

    useEffect(() => {
        if (!aiEnabled || !activePet?.name || !activePet?.breed) {
            return
        }

        let active = true
        queueMicrotask(() => {
            if (!active) return
            setRecommendationsLoading(true)
            setRecommendationsReady(false)
        })
        aiPreviewApi.getRecommendations({
            serviceId: selectedService.id,
            petId: activePetId,
            petName: activePet.name,
            petType: activePet.type || 'dog',
            breed: activePet.breed,
            coatType: activePet.coatType || '',
            season: season.key
        }).then(({ data }) => {
            if (!active) return
            setRecommendations(data.recommendations || [])
        }).catch(() => {
            if (active) setRecommendations([])
        }).finally(() => {
            if (active) {
                setRecommendationsLoading(false)
                setRecommendationsReady(true)
            }
        })

        return () => { active = false }
    }, [aiEnabled, activePet?.name, activePet?.breed, activePet?.type, activePet?.coatType, activePetId, selectedService?.id, season.key])

    useEffect(() => {
        if (!selectedServiceId) {
            return
        }

        queueMicrotask(() => setCalendarLoading(true))
        appointmentsApi.getMonthAvailability(monthKey, selectedServiceId)
            .then(({ data }) => {
                const map = Object.fromEntries((data.dates || []).map((item) => [item.date, item.status]))
                setMonthStatuses(map)
            })
            .catch((error) => {
                setMonthStatuses({})
                toast.error(getErrorMessage(error))
            })
            .finally(() => setCalendarLoading(false))
    }, [monthKey, selectedServiceId])

    useEffect(() => {
        if (!selectedDate || !selectedServiceId) {
            return
        }

        let active = true

        queueMicrotask(() => {
            if (active) setSlotsLoading(true)
        })

        appointmentsApi
            .getAvailability(selectedDate, selectedServiceId)
            .then(({ data }) => {
                if (!active) return

                const fixedSlots = normalizeFixedSlots(
                    Array.isArray(data?.slots)
                        ? data.slots
                        : []
                )

                setSlots(fixedSlots)
            })
            .catch((error) => {
                if (!active) return

                setSlots([])
                toast.error(getErrorMessage(error))
            })
            .finally(() => {
                if (active) {
                    setSlotsLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [selectedDate, selectedServiceId])

    useEffect(() => () => {
        if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    }, [photoPreview])

    const resetStyleGallery = ({ clearPhoto = false } = {}) => {
        galleryRunIdRef.current += 1
        startedGalleryKeyRef.current = ''
        photoVerificationTokenRef.current = ''
        setStylePreviews({})
        setSelectedStyleId('')
        setGeneratedPreview('')
        setGeneratedPreviewMeta(null)
        setPreviewFromCache(false)
        setVerificationStatus('idle')
        setGalleryGenerating(false)
        setGalleryMessage('')

        if (clearPhoto) {
            setPhotoDataUrl('')
            setPhotoPreview('')
            setPhotoHash('')
        }
    }

    const selectService = (serviceId) => {
        setSelectedServiceId(serviceId)
        setSelectedDate('')
        setSelectedTime('')
        setSlots([])
        setRecommendations([])
        setRecommendationsReady(false)
        setConsent(false)
        resetStyleGallery({ clearPhoto: true })
    }

    const selectStyle = (styleId) => {
        const stylePreview = stylePreviews[styleId]

        if (
            stylePreview?.status !== 'ready' ||
            !stylePreview.generatedImage
        ) {
            return
        }

        setSelectedStyleId(styleId)
        setGeneratedPreview(
            stylePreview.generatedImage
        )
        setGeneratedPreviewMeta({
            previewId:
                stylePreview.previewId || null,
            model: stylePreview.model || null,
            previewVersion:
                stylePreview.previewVersion ||
                previewVersion,
            sourcePhotoHash:
                stylePreview.sourcePhotoHash ||
                photoHash,
            verification:
                stylePreview.verification || null,
            fidelityCheck:
                stylePreview.fidelityCheck || null,
            season: stylePreview.season || {
                key: season.key,
                label: season.label
            },
            styleId,
            styleName:
                stylePreview.styleName ||
                compatibleStyles.find(
                    (style) => style.id === styleId
                )?.name
        })
        setPreviewFromCache(
            Boolean(stylePreview.fromCache)
        )
    }

    const handlePhoto = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Upload a JPG, PNG, or WEBP image')
            event.target.value = ''
            return
        }

        if (file.size > 7 * 1024 * 1024) {
            toast.error('The photo must be 7 MB or smaller')
            event.target.value = ''
            return
        }

        if (photoPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreview)
        }

        resetStyleGallery()
        setPhotoPreview(URL.createObjectURL(file))
        setPhotoDataUrl('')
        setPhotoHash('')

        try {
            const [dataUrl, hash] = await Promise.all([
                fileToDataUrl(file),
                hashFile(file)
            ])
            setPhotoDataUrl(dataUrl)
            setPhotoHash(hash)
        } catch {
            toast.error('Unable to prepare this pet photo')
        }
    }

    const resetForPetChange = () => {
        setRecommendations([])
        setRecommendationsReady(false)
        setConsent(false)
        resetStyleGallery({ clearPhoto: true })
    }

    const handleConsentChange = (value) => {
        setConsent(value)

        if (!value) {
            resetStyleGallery()
        }
    }

    const buildStyleCacheKey = (styleId) =>
        createPreviewCacheKey({
            photoHash,
            petType: activePet.type,
            breed: activePet.breed,
            styleId,
            seasonKey: season.key,
            previewVersion
        })

    const setStylePreviewForRun = (
        runId,
        styleId,
        value
    ) => {
        if (galleryRunIdRef.current !== runId) return

        setStylePreviews((current) => ({
            ...current,
            [styleId]: {
                ...(current[styleId] || {}),
                ...value
            }
        }))
    }

    const getCommonPreviewPayload = () => ({
        petPhotoDataUrl: photoDataUrl,
        serviceId: selectedService.id,
        petId: activePetId,
        petName: activePet.name,
        petType: activePet.type || 'dog',
        breed: activePet.breed,
        coatType: activePet.coatType || '',
        consent: true
    })

    const createStylePreview = async ({
        style,
        verificationToken,
        runId
    }) => {
        setStylePreviewForRun(
            runId,
            style.id,
            { status: 'generating', error: '' }
        )

        try {
            const { data } = await aiPreviewApi.generate({
                ...getCommonPreviewPayload(),
                styleId: style.id,
                photoVerificationToken:
                    verificationToken
            })
            const preview = data.preview
            const entry = {
                status: 'ready',
                generatedImage:
                    preview.generatedImage,
                previewId:
                    preview.previewId || null,
                model: preview.model || null,
                previewVersion:
                    preview.previewVersion ||
                    previewVersion,
                sourcePhotoHash:
                    preview.sourcePhotoHash ||
                    photoHash,
                verification:
                    preview.verification || null,
                fidelityCheck:
                    preview.fidelityCheck || null,
                season: preview.season || {
                    key: season.key,
                    label: season.label
                },
                styleId: preview.styleId,
                styleName: preview.styleName,
                fromCache: false,
                error: ''
            }

            setStylePreviewForRun(
                runId,
                style.id,
                entry
            )

            await saveCachedPreview({
                key: buildStyleCacheKey(style.id),
                ...entry,
                petType: activePet.type || 'dog',
                breed: activePet.breed
            })

            return {
                success: true,
                stopQueue: false
            }
        } catch (error) {
            const errorCode =
                error?.response?.data?.code || ''
            const errorMessage =
                getErrorMessage(error)

            if (
                errorCode ===
                'PHOTO_VERIFICATION_EXPIRED'
            ) {
                photoVerificationTokenRef.current = ''
            }

            setStylePreviewForRun(
                runId,
                style.id,
                {
                    status: 'error',
                    error: errorMessage,
                    errorCode
                }
            )

            return {
                success: false,
                stopQueue: false,
                error: errorMessage,
                errorCode
            }
        }
    }

    const startPersonalizedGallery = async (
        onlyStyleIds = null
    ) => {
        if (galleryBusyRef.current) {
            if (onlyStyleIds) {
                toast('Please wait for the current preview to finish')
            }
            return
        }

        const targetStyles = onlyStyleIds
            ? compatibleStyles.filter((style) =>
                onlyStyleIds.includes(style.id)
            )
            : compatibleStyles

        if (!targetStyles.length) return

        galleryBusyRef.current = true
        const runId = galleryRunIdRef.current + 1
        galleryRunIdRef.current = runId
        setGalleryGenerating(true)
        setGalleryMessage(
            'Loading saved style examples…'
        )

        if (!onlyStyleIds) {
            setSelectedStyleId('')
            setGeneratedPreview('')
            setGeneratedPreviewMeta(null)
            setPreviewFromCache(false)
            setStylePreviews(
                Object.fromEntries(
                    targetStyles.map((style) => [
                        style.id,
                        { status: 'idle' }
                    ])
                )
            )
        } else {
            setStylePreviews((current) => ({
                ...current,
                ...Object.fromEntries(
                    targetStyles.map((style) => [
                        style.id,
                        { status: 'queued' }
                    ])
                )
            }))
        }

        try {
            const cachedResults = await Promise.all(
                targetStyles.map(async (style) => ({
                    style,
                    cached: await getCachedPreview(
                        buildStyleCacheKey(style.id)
                    )
                }))
            )

            if (galleryRunIdRef.current !== runId) return

            const stylesToGenerate = []

            cachedResults.forEach(({ style, cached }) => {
                if (cached?.generatedImage && !onlyStyleIds) {
                    setStylePreviewForRun(
                        runId,
                        style.id,
                        {
                            ...cached,
                            status: 'ready',
                            fromCache: true,
                            error: ''
                        }
                    )
                } else {
                    stylesToGenerate.push(style)
                }
            })

            const stylesForRun =
                getAutomaticPreviewStyles({
                    stylesToGenerate,
                    recommendations,
                    manualRequest:
                        Boolean(onlyStyleIds)
                })

            if (!stylesForRun.length) {
                setVerificationStatus('verified')
                setGalleryMessage('')
                return
            }

            let verificationToken =
                photoVerificationTokenRef.current

            if (!verificationToken) {
                setVerificationStatus('checking')
                setGalleryMessage(
                    'Checking your pet photo once…'
                )

                const { data } =
                    await aiPreviewApi.verifyPhoto(
                        getCommonPreviewPayload()
                    )

                if (galleryRunIdRef.current !== runId) return

                const photoVerification =
                    data?.photoVerification
                const sourceCheck =
                    photoVerification?.verification
                const expectedPetType = String(
                    activePet.type || ''
                ).toLowerCase()

                if (
                    sourceCheck?.policyVersion !==
                        SOURCE_PHOTO_POLICY_VERSION
                ) {
                    throw new Error(
                        'The running backend still uses an older pet-photo verifier. Restart the updated backend, then upload the photo again.'
                    )
                }

                if (
                    sourceCheck?.valid !== true ||
                    sourceCheck?.detectedAnimal !==
                        expectedPetType
                ) {
                    throw new Error(
                        `This photo does not pass the ${expectedPetType} verification. Upload a clear photo of the selected ${expectedPetType}.`
                    )
                }

                verificationToken =
                    photoVerification.token
                photoVerificationTokenRef.current =
                    verificationToken
                setVerificationStatus('verified')
            }

            setGalleryMessage(
                onlyStyleIds
                    ? 'Creating your selected style…'
                    : 'Creating the top seasonal suggestion…'
            )
            const queueResult = await runStyleQueue(
                stylesForRun,
                (style) => createStylePreview({
                    style,
                    verificationToken,
                    runId
                })
            )

            if (queueResult.stopQueue) {
                const pausedMessage =
                    queueResult.error ||
                    'AI capacity is temporarily exhausted. Try unfinished styles again in a few minutes.'

                setStylePreviews((current) =>
                    Object.fromEntries(
                        Object.entries(current).map(
                            ([styleId, entry]) => [
                                styleId,
                                entry.status === 'queued'
                                    ? {
                                        ...entry,
                                        status: 'error',
                                        error: pausedMessage,
                                        errorCode:
                                            'AI_QUOTA_EXHAUSTED'
                                    }
                                    : entry
                            ]
                        )
                    )
                )
                toast.error(pausedMessage)
            }
        } catch (error) {
            if (galleryRunIdRef.current !== runId) return

            setVerificationStatus('error')
            setStylePreviews((current) =>
                Object.fromEntries(
                    Object.entries(current).map(
                        ([styleId, entry]) => [
                            styleId,
                            entry.status === 'ready'
                                ? entry
                                : {
                                    ...entry,
                                    status: 'error',
                                    error:
                                        getErrorMessage(error)
                                }
                        ]
                    )
                )
            )
            toast.error(getErrorMessage(error))
        } finally {
            galleryBusyRef.current = false

            if (galleryRunIdRef.current === runId) {
                setGalleryGenerating(false)
                setGalleryMessage('')
            }
        }
    }

    const retryStylePreview = (styleId) => {
        if (galleryBusyRef.current) return
        startPersonalizedGallery([styleId])
    }

    const retryFailedStylePreviews = () => {
        if (galleryBusyRef.current) return

        const nextStyleId = getNextFailedStyleId({
            stylePreviews,
            recommendations
        })

        if (nextStyleId) {
            startPersonalizedGallery([nextStyleId])
        }
    }

    const galleryInputKey = (
        aiEnabled &&
        consent &&
        photoDataUrl &&
        photoHash &&
        previewVersion &&
        compatibleStyles.length &&
        recommendationsReady &&
        !stylesLoading &&
        !recommendationsLoading
    )
        ? [
            selectedService.id,
            activePetId || activePet.name,
            activePet.type,
            activePet.breed,
            activePet.coatType || '',
            photoHash,
            previewVersion,
            compatibleStyles.map((style) => style.id).join(','),
            recommendations.map((item) => item.id).join(',')
        ].join('|')
        : ''
    const hasStyleFailures = Object.values(
        stylePreviews
    ).some((preview) => preview.status === 'error')

    /* The gallery runner is deliberately keyed by the complete, stable input
       signature. Adding its render-local function identity would restart the
       paid generation workflow after every preview-state update. */
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (
            !galleryInputKey ||
            startedGalleryKeyRef.current === galleryInputKey
        ) {
            return
        }

        startedGalleryKeyRef.current = galleryInputKey
        queueMicrotask(() => {
            if (
                startedGalleryKeyRef.current === galleryInputKey
            ) {
                startPersonalizedGallery()
            }
        })
    }, [galleryInputKey])
    /* eslint-enable react-hooks/exhaustive-deps */

    const validate = () => {
        if (!selectedService) return 'Select a service'
        if (!activePet?.name || !activePet?.breed || !activePet?.type) return 'Complete the pet information'
        if (aiEnabled && !selectedStyle) return 'Select a grooming style'
        if (!selectedDate || !selectedSlot) return 'Select an available date and time'
        if (!user?.phone) return 'Complete your profile with a phone number'
        return ''
    }

    const submitBooking = async () => {
        const validationMessage = validate()
        if (validationMessage) {
            toast.error(validationMessage)
            return
        }

        setSubmitting(true)
        try {
            let petId = activePetId || ''
            let petRecord = petMode === 'existing'
                ? selectedPet
                : null
            if (petMode === 'new') {
                const { data } = await petsApi.create(newPet)
                petRecord = data.pet
                petId = data.pet._id
                setPets((current) => [data.pet, ...current])
                setSelectedPetId(data.pet._id)
            }

            const { data } = await appointmentsApi.create({
                petId,
                petName: petRecord?.name || activePet.name,
                petType: petRecord?.type || activePet.type,
                breed: petRecord?.breed || activePet.breed,
                serviceId: selectedService.id,
                haircutStyle: selectedStyle?.id || null,
                aiPreviewUsed: Boolean(generatedPreview),
                aiPreviewId: generatedPreviewMeta?.previewId || null,
                aiPreviewImage: generatedPreviewMeta?.previewId
                    ? null
                    : generatedPreview || null,
                aiPreviewModel: generatedPreviewMeta?.model || null,
                aiPreviewSourceHash: generatedPreviewMeta?.sourcePhotoHash || photoHash || null,
                date: selectedDate,
                time: selectedTime,
                ownerName: `${user.firstName} ${user.lastName}`.trim(),
                ownerEmail: user.email || '',
                ownerPhone: user.phone,
                ownerAddress: user.homeAddress || '',
                notes
            })

            setBooked(data.appointment)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    if (booked) {
        return (
            <div className='min-h-[calc(100vh-64px)] bg-[#fbf7f1] px-5 py-16'>
                <div className='mx-auto max-w-2xl rounded-3xl border border-[#e7d8c8] bg-white p-8 text-center shadow-xl sm:p-12 space-y-6'>
                    <span className='mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#dcf5e7] text-[#24523f] shadow-xs'>
                        <PawPrint size={34} />
                    </span>
                    <div>
                        <h1 className='font-serif text-4xl font-bold text-[#201711]'>Appointment Booked</h1>
                        <p className='mt-2 text-sm text-[#806654]'>Your request was saved and is waiting for staff confirmation.</p>
                    </div>

                    <div className='rounded-2xl border border-[#eadfce] bg-[#fcfaf7] p-6 text-left space-y-2.5'>
                        <SummaryRow label='Pet' value={`${booked.petName} (${booked.breed})`} />
                        <SummaryRow label='Service' value={booked.service} />
                        {booked.haircutStyle && <SummaryRow label='Style' value={booked.haircutStyle} />}
                        <SummaryRow label='Date' value={formatDateLong(booked.date)} />
                        <SummaryRow label='Time' value={formatTimeRange(booked.time, booked.endTime)} />
                        <SummaryRow label='Total' value={`₱${Number(booked.price).toLocaleString('en-PH')}`} strong />
                    </div>

                    {/* Arrival Policy Notice Banner */}
                    <div className='rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left flex items-start gap-3 text-amber-950 shadow-xs'>
                        <Clock size={20} className='text-amber-700 shrink-0 mt-0.5' />
                        <div className='text-xs leading-relaxed'>
                            <p className='font-bold text-amber-900 text-sm mb-1'>Studio Arrival Policy:</p>
                            <p>Please arrive <strong>5–10 minutes before</strong> your scheduled appointment time.</p>
                            <p className='mt-1 text-amber-800 font-semibold'>⚠️ Late arrival beyond 10 minutes will automatically cancel the appointment.</p>
                        </div>
                    </div>

                    <div className='flex flex-col justify-center gap-3 sm:flex-row pt-2'>
                        <button onClick={() => navigate('/appointments')} className='rounded-full bg-[#bf5a31] px-7 py-3.5 font-bold text-white shadow-xs transition hover:bg-[#a94723]'>View Appointments</button>
                        <button onClick={() => navigate('/dashboard')} className='rounded-full border border-[#dfcfbd] px-7 py-3.5 font-bold text-[#5f4637] transition hover:bg-[#faf6f0]'>Back to Dashboard</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#fbf7f1] px-4 py-10 sm:px-6'>
            <div className='mx-auto max-w-7xl'>
                <div className='mb-6'>
                    <p className='text-xs font-bold uppercase tracking-[0.22em] text-[#b84c25]'>Unified booking</p>
                    <h1 className='mt-2 font-serif text-4xl font-bold sm:text-5xl'>Book a grooming appointment</h1>
                    <p className='mt-3 max-w-3xl text-[#806654]'>Select a service, pet, optional AI style preview, and an available schedule without leaving this page.</p>
                </div>

                <div className='mb-8 rounded-2xl border border-[#e5d6c5] bg-white p-3 sm:p-4 shadow-sm'>
                    <div className='grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4'>
                        <div className={`flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 text-xs font-bold transition ${selectedService && activePet?.name ? 'bg-[#f2f8f4] text-[#24523f]' : 'bg-[#fff8f3] text-[#a94723]'}`}>
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${selectedService && activePet?.name ? 'bg-[#24523f] text-white' : 'bg-[#bf5a31] text-white'}`}>
                                {selectedService && activePet?.name ? <Check size={13} /> : '1'}
                            </span>
                            <span className='truncate'>1. Pet & Service</span>
                        </div>

                        <div className={`flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 text-xs font-bold transition ${selectedStyle ? 'bg-[#f2f8f4] text-[#24523f]' : selectedService ? 'bg-[#fff8f3] text-[#a94723]' : 'bg-[#f7f2eb] text-[#9a8677]'}`}>
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${selectedStyle ? 'bg-[#24523f] text-white' : selectedService ? 'bg-[#bf5a31] text-white' : 'bg-[#d9c8b8] text-white'}`}>
                                {selectedStyle ? <Check size={13} /> : '2'}
                            </span>
                            <span className='truncate'>2. AI Cut Preview</span>
                        </div>

                        <div className={`flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 text-xs font-bold transition ${selectedDate && selectedSlot ? 'bg-[#f2f8f4] text-[#24523f]' : selectedStyle ? 'bg-[#fff8f3] text-[#a94723]' : 'bg-[#f7f2eb] text-[#9a8677]'}`}>
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${selectedDate && selectedSlot ? 'bg-[#24523f] text-white' : selectedStyle ? 'bg-[#bf5a31] text-white' : 'bg-[#d9c8b8] text-white'}`}>
                                {selectedDate && selectedSlot ? <Check size={13} /> : '3'}
                            </span>
                            <span className='truncate'>3. Date & Schedule</span>
                        </div>

                        <div className={`flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 text-xs font-bold transition ${!validate() ? 'bg-[#f2f8f4] text-[#24523f]' : 'bg-[#f7f2eb] text-[#9a8677]'}`}>
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${!validate() ? 'bg-[#24523f] text-white' : 'bg-[#d9c8b8] text-white'}`}>
                                4
                            </span>
                            <span className='truncate'>4. Confirmation</span>
                        </div>
                    </div>
                </div>

                <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]'>
                    <div className='space-y-7'>
                        <Section number='1' title='Service and pet' description='Choose the grooming service and the pet you are booking for.' icon={<Scissors size={19} className='text-[#a94723]' />}>
                            <div className='grid gap-3 md:grid-cols-2'>
                                {services.map((service) => {
                                    const selected = selectedServiceId === service.id
                                    return (
                                        <button key={service.id} type='button' onClick={() => selectService(service.id)} aria-pressed={selected} className={`rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84522] focus-visible:ring-offset-2 ${selected ? 'border-[#a84522] bg-[#fff3ec] ring-1 ring-[#a84522]' : 'border-[#e5d6c5] bg-white hover:border-[#c88968]'}`}>
                                            <div className='flex items-start justify-between gap-4'>
                                                <div><h3 className='font-serif text-xl font-bold'>{service.name}</h3><p className='mt-2 text-sm leading-6 text-[#806654]'>{service.description}</p></div>
                                                {selected && <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#bf5a31] text-white'><Check size={15} /></span>}
                                            </div>
                                            <div className='mt-4 flex items-center justify-between text-sm'><span className='font-bold text-[#b84c25]'>₱{service.price.toLocaleString('en-PH')}</span><span className='flex items-center gap-2 text-[#806654]'><Clock3 size={14} />{service.durationMinutes} minutes</span></div>
                                            {service.supportsAiPreview && <p className='mt-3 text-xs font-semibold text-[#24523f]'>Style preview available</p>}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className='my-7 h-px bg-[#eadfce]' />
                            <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
                                <div><h3 className='font-serif text-xl font-bold'>Pet information</h3><p className='mt-1 text-sm text-[#806654]'>Use a saved pet or add a new profile.</p></div>
                                <div className='inline-flex rounded-full bg-[#eee2d3] p-1'>
                                    <button type='button' onClick={() => { setPetMode('existing'); resetForPetChange() }} disabled={!pets.length} className={`rounded-full px-5 py-2 text-sm font-bold ${petMode === 'existing' ? 'bg-white shadow-sm' : 'text-[#806654]'} disabled:opacity-40`}>Saved Pet</button>
                                    <button type='button' onClick={() => { setPetMode('new'); resetForPetChange() }} className={`rounded-full px-5 py-2 text-sm font-bold ${petMode === 'new' ? 'bg-white shadow-sm' : 'text-[#806654]'}`}>New Pet</button>
                                </div>
                            </div>

                            {petMode === 'existing' ? (
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    {pets.map((pet) => (
                                        <button key={pet._id} type='button' onClick={() => { setSelectedPetId(pet._id); resetForPetChange() }} aria-pressed={selectedPetId === pet._id} className={`rounded-2xl border p-4 text-left transition ${selectedPetId === pet._id ? 'border-[#a84522] bg-[#fff3ec]' : 'border-[#e5d6c5] bg-white hover:border-[#c88968]'}`}>
                                            <p className='font-serif text-xl font-bold'>{pet.name}</p>
                                            <p className='mt-1 text-sm text-[#806654]'>{pet.type === 'cat' ? 'Cat' : 'Dog'} · {pet.breed}</p>
                                            {pet.coatType && <p className='mt-2 text-xs text-[#8c7565]'>{pet.coatType}</p>}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <Input label='Pet name' value={newPet.name} onChange={(value) => { setNewPet({ ...newPet, name: value }); resetForPetChange() }} />
                                    <label className='block'><Label>Pet type</Label><select value={newPet.type} onChange={(event) => { setNewPet({ ...newPet, type: event.target.value }); resetForPetChange() }} className='w-full rounded-xl border border-[#dfcfbd] bg-white px-4 py-3.5'><option value='dog'>Dog</option><option value='cat'>Cat</option></select></label>
                                    <Input label='Breed' value={newPet.breed} onChange={(value) => { setNewPet({ ...newPet, breed: value }); resetForPetChange() }} />
                                    <Input label='Coat type (optional)' value={newPet.coatType} onChange={(value) => { setNewPet({ ...newPet, coatType: value }); resetForPetChange() }} placeholder='Long, short, curly, double coat' />
                                    <label className='block sm:col-span-2'><Label>Pet notes (optional)</Label><textarea value={newPet.notes} onChange={(event) => setNewPet({ ...newPet, notes: event.target.value })} rows={3} className='w-full rounded-xl border border-[#dfcfbd] px-4 py-3 outline-none focus:border-[#b84c25]' /></label>
                                </div>
                            )}
                        </Section>

                        <Section number='2' title='Style and preview' description={aiEnabled ? 'Upload one pet photo, compare personalized styles, and choose a grooming reference.' : 'A style preview is available for Full Grooming and Custom Styling.'} icon={<WandSparkles size={19} className='text-[#a94723]' />} disabled={!selectedService || !activePet?.name || !activePet?.breed}>
                            {!aiEnabled ? (
                                <div className='rounded-2xl border border-[#e5d6c5] bg-[#f7f2eb] p-6 text-sm text-[#806654]'>The selected service does not need a hairstyle preview. Continue to the schedule.</div>
                            ) : (
                                <AiPreviewPanel
                                    season={season}
                                    photoPreview={photoPreview}
                                    onPhotoChange={handlePhoto}
                                    generatedPreview={generatedPreview}
                                    selectedStyleName={selectedStyle?.name || ''}
                                    previewFromCache={previewFromCache}
                                    consent={consent}
                                    onConsentChange={handleConsentChange}
                                    verificationStatus={verificationStatus}
                                    galleryGenerating={galleryGenerating}
                                    galleryMessage={galleryMessage}
                                    hasFailures={hasStyleFailures}
                                    onRetryFailures={retryFailedStylePreviews}
                                    onRegenerateSelected={() => selectedStyleId && retryStylePreview(selectedStyleId)}
                                >
                                    <StylePicker
                                        styles={compatibleStyles}
                                        recommendations={recommendations}
                                        stylePreviews={stylePreviews}
                                        selectedStyleId={selectedStyleId}
                                        onSelect={selectStyle}
                                        onRetry={retryStylePreview}
                                        petType={activePet?.type}
                                        photoReady={Boolean(photoDataUrl && consent)}
                                        loading={stylesLoading || recommendationsLoading}
                                        generationBusy={galleryGenerating}
                                    />
                                </AiPreviewPanel>
                            )}
                        </Section>

                        <Section number='3' title='Schedule' description='Choose an available date and one two-hour time period.' icon={<CalendarDays size={19} className='text-[#a94723]' />} disabled={!selectedService || !activePet?.name || !activePet?.breed || (aiEnabled && !selectedStyle)}>
                            <div className='grid gap-5 xl:grid-cols-[1fr_1fr]'>
                                <AvailabilityCalendar
                                    monthKey={monthKey}
                                    selectedDate={selectedDate}
                                    statuses={monthStatuses}
                                    onMonthChange={(key) => { setMonthKey(key); setSelectedDate(''); setSelectedTime(''); setSlots([]) }}
                                    onSelect={(date) => { setSelectedDate(date); setSelectedTime(''); setSlots([]) }}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    loading={calendarLoading}
                                />
                                <div>
                                    <h3 className='mb-3 font-serif text-xl font-bold'>{selectedDate ? formatDateLong(selectedDate) : 'Available time periods'}</h3>
                                    <TimeSlotGrid slots={slots} selectedTime={selectedTime} onSelect={setSelectedTime} loading={slotsLoading} />
                                </div>
                            </div>

                            <div className='my-7 h-px bg-[#eadfce]' />
                            <label className='block'>
                                <Label>Notes for the groomer (optional)</Label>
                                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={500} placeholder='Temperament, skin sensitivity, handling instructions, or anything else we should know' className='w-full rounded-xl border border-[#dfcfbd] bg-white px-4 py-3 outline-none focus:border-[#b84c25]' />
                            </label>
                            <p className='mt-2 text-right text-xs text-[#8b7769]'>{notes.length}/500</p>
                        </Section>
                    </div>

                    <aside className='sticky top-24 rounded-3xl border border-[#dfcfbd] bg-white p-6 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <span className='grid h-9 w-9 place-items-center rounded-full bg-[#f1e5d7] font-mono text-xs font-bold text-[#9c4424]'>4</span>
                            <div><p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[#a94723]'>Review</p><h2 className='font-serif text-2xl font-bold'>Booking summary</h2></div>
                        </div>
                        <div className='mt-6 space-y-1'>
                            <SummaryRow label='Pet' value={activePet?.name || 'Not selected'} />
                            <SummaryRow label='Breed' value={activePet?.breed || 'Not selected'} />
                            <SummaryRow label='Service' value={selectedService?.name || 'Not selected'} />
                            {aiEnabled && <SummaryRow label='Style' value={selectedStyle?.name || 'Not selected'} />}
                            {aiEnabled && generatedPreview && <SummaryRow label='Style preview' value='Ready' />}
                            <SummaryRow label='Date' value={selectedDate ? formatDateLong(selectedDate) : 'Not selected'} />
                            <SummaryRow label='Time' value={selectedSlot ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime) : 'Not selected'} />
                        </div>
                        <div className='my-6 h-px bg-[#eadfce]' />
                        <div className='flex items-end justify-between'><span className='font-serif text-xl font-bold'>Total</span><span className='font-serif text-3xl font-bold text-[#b84c25]'>₱{Number(selectedService?.price || 0).toLocaleString('en-PH')}</span></div>
                        <button onClick={submitBooking} disabled={submitting} className='mt-6 w-full rounded-full bg-[#bf5a31] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50'>{submitting ? 'Saving appointment...' : 'Confirm Booking'}</button>
                    </aside>
                </div>
            </div>

            {/* Mobile Fixed Sticky Booking Summary Bar */}
            <div className='fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5d6c5] bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden'>
                <div className='flex items-center justify-between gap-3 max-w-7xl mx-auto'>
                    <div>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723] truncate max-w-[160px]'>
                            {selectedService?.name || 'Grooming'} {selectedStyle ? `• ${selectedStyle.name}` : ''}
                        </p>
                        <p className='font-serif text-lg font-bold text-[#b84c25]'>
                            ₱{Number(selectedService?.price || 0).toLocaleString('en-PH')}
                        </p>
                    </div>
                    <button
                        onClick={submitBooking}
                        disabled={submitting}
                        className='rounded-full bg-[#bf5a31] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#a84522] disabled:opacity-50'
                    >
                        {submitting ? 'Saving...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function Section({ number, title, description, icon, disabled = false, children }) {
    return (
        <section className={`rounded-3xl border border-[#e5d6c5] bg-[#fffdf9] p-5 shadow-sm sm:p-7 ${disabled ? 'pointer-events-none opacity-45' : ''}`}>
            <div className='mb-6 flex items-start gap-4'>
                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1e5d7] font-mono text-sm font-bold text-[#9c4424]'>{number}</span>
                <div className='flex-1'><div className='flex items-center gap-2'>{icon}<h2 className='font-serif text-2xl font-bold sm:text-3xl'>{title}</h2></div><p className='mt-2 text-sm leading-6 text-[#806654]'>{description}</p></div>
            </div>
            {children}
        </section>
    )
}

function Label({ children }) {
    return <span className='mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7b5f4c]'>{children}</span>
}

function Input({ label, value, onChange, ...props }) {
    return <label className='block'><Label>{label}</Label><input value={value} onChange={(event) => onChange(event.target.value)} className='w-full rounded-xl border border-[#dfcfbd] bg-white px-4 py-3.5 outline-none focus:border-[#b84c25]' {...props} /></label>
}

function SummaryRow({ label, value, strong = false }) {
    return <div className='flex items-start justify-between gap-5 border-b border-[#f0e7dd] py-3 last:border-0'><span className='text-sm text-[#806654]'>{label}</span><span className={`text-right text-sm ${strong ? 'font-bold text-[#b84c25]' : 'font-semibold text-[#2b2019]'}`}>{value}</span></div>
}
