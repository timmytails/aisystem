const SOURCE_PHOTO_POLICY_VERSION =
    'species-v4-neutral-context-bound'

const MIN_SPECIES_CONFIDENCE = 0.9
const MAX_PHOTO_VERIFICATION_TIMEOUT_MS = 30000
const MIN_PHOTO_VERIFICATION_TIMEOUT_MS = 10000
const MAX_SOURCE_MODEL_TIMEOUT_MS = 15000
const MIN_SOURCE_MODEL_TIMEOUT_MS = 5000

const supportedAnimals = new Set([
    'dog',
    'cat',
    'other',
    'unclear'
])

const buildPetPhotoClassificationPrompt = () => [
    'You are a neutral animal species classifier for an uploaded photograph.',
    'Classify the main visible animal only from the image pixels before considering any surrounding request.',
    'You are not given the registered or expected pet species, and you must not infer one from filenames, metadata, breed names, or user intent.',
    'Return dog only when the main animal visibly has canine features, cat only when it visibly has feline features, other for another animal, and unclear when the species cannot be identified confidently.',
    'Set clearPet to false when there is no clear main animal, the animal is heavily obscured, or multiple animals are equally prominent.',
    'Give a confidence from 0 to 1 based only on visible evidence. Do not be agreeable and do not guess.'
].join(' ')

const normalizePetPhotoClassification = ({
    classification,
    expectedPetType,
    model
}) => {
    const normalizedExpectedType = String(
        expectedPetType || ''
    ).trim().toLowerCase()
    const proposedAnimal = String(
        classification?.detectedAnimal || ''
    ).trim().toLowerCase()
    const detectedAnimal = supportedAnimals.has(
        proposedAnimal
    )
        ? proposedAnimal
        : 'unclear'
    const proposedConfidence = Number(
        classification?.confidence
    )
    const confidence = Number.isFinite(
        proposedConfidence
    )
        ? Math.min(1, Math.max(0, proposedConfidence))
        : 0
    const clearPet =
        classification?.clearPet === true
    const valid = Boolean(
        ['dog', 'cat'].includes(normalizedExpectedType) &&
        clearPet &&
        confidence >= MIN_SPECIES_CONFIDENCE &&
        detectedAnimal === normalizedExpectedType
    )

    return {
        valid,
        detectedAnimal,
        clearPet,
        confidence,
        reason: String(
            classification?.reason ||
            (valid
                ? `A clear ${normalizedExpectedType} is visible.`
                : `The uploaded image does not clearly match the selected ${normalizedExpectedType}.`)
        ).slice(0, 300),
        model,
        policyVersion: SOURCE_PHOTO_POLICY_VERSION
    }
}

const normalizePhotoVerificationTimeout = (value) => {
    const proposed = Number(value)
    const timeout = Number.isFinite(proposed) && proposed > 0
        ? proposed
        : MAX_PHOTO_VERIFICATION_TIMEOUT_MS

    return Math.min(
        MAX_PHOTO_VERIFICATION_TIMEOUT_MS,
        Math.max(MIN_PHOTO_VERIFICATION_TIMEOUT_MS, timeout)
    )
}

const normalizeSourceModelTimeout = (value) => {
    const proposed = Number(value)
    const timeout = Number.isFinite(proposed) && proposed > 0
        ? proposed
        : 12000

    return Math.min(
        MAX_SOURCE_MODEL_TIMEOUT_MS,
        Math.max(MIN_SOURCE_MODEL_TIMEOUT_MS, timeout)
    )
}

const getSourceVerificationModels = ({
    primary,
    fallback
} = {}) => Array.from(new Set([
    String(primary || 'gemini-2.5-flash-lite').trim(),
    String(fallback || 'gemini-2.5-flash').trim()
].filter(Boolean)))

module.exports = {
    SOURCE_PHOTO_POLICY_VERSION,
    MIN_SPECIES_CONFIDENCE,
    buildPetPhotoClassificationPrompt,
    getSourceVerificationModels,
    normalizePetPhotoClassification,
    normalizePhotoVerificationTimeout,
    normalizeSourceModelTimeout
}
