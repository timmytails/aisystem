import { useEffect, useState } from 'react'
import { Camera, Dog, Cat, Pencil, Plus, Trash2, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage, petsApi } from '../utils/api'
import ConfirmModal from '../components/ConfirmModal'

const emptyPet = {
    name: '',
    type: 'dog',
    breed: '',
    coatType: '',
    notes: '',
    ageMonths: '',
    vaccinated: 'yes',
    photoUrl: ''
}

export default function MyPets() {
    const [pets, setPets] = useState([])
    const [form, setForm] = useState(emptyPet)
    const [editingId, setEditingId] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [confirmDeletePet, setConfirmDeletePet] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const loadPets = () =>
        petsApi.getMine()
            .then(({ data }) => setPets(data.pets || []))
            .finally(() => setLoading(false))

    useEffect(() => { loadPets() }, [])

    const openNew = () => {
        setEditingId('')
        setForm(emptyPet)
        setOpen(true)
    }

    const openEdit = (pet) => {
        setEditingId(pet._id)
        setForm({
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            coatType: pet.coatType || '',
            notes: pet.notes || '',
            ageMonths: pet.ageMonths !== undefined && pet.ageMonths !== null ? String(pet.ageMonths) : '',
            vaccinated: pet.vaccinated === false ? 'no' : 'yes',
            photoUrl: pet.photoUrl || ''
        })
        setOpen(true)
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 8 * 1024 * 1024) {
            toast.error('Image must be under 8 MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, photoUrl: reader.result }))
        }
        reader.readAsDataURL(file)
    }

    const save = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingId) await petsApi.update(editingId, form)
            else await petsApi.create(form)
            toast.success(editingId ? 'Pet updated successfully' : 'Pet added successfully')
            setOpen(false)
            await loadPets()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!confirmDeletePet) return
        setDeleting(true)
        try {
            await petsApi.remove(confirmDeletePet._id)
            setPets((c) => c.filter((p) => p._id !== confirmDeletePet._id))
            toast.success('Pet profile removed successfully')
            setConfirmDeletePet(null)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#F8F7F4] px-4 py-10 text-slate-900 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-6xl'>

                {/* Page Header */}
                <div className='mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end'>
                    <div>
                        <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                            Pet Profiles
                        </span>
                        <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                            My Pets
                        </h1>
                        <p className='mt-1 text-sm text-slate-600'>
                            Manage your pet profiles and photos for seamless appointment booking.
                        </p>
                    </div>
                    <button
                        onClick={openNew}
                        className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#C25E2B] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#A84E20] active:scale-[0.98]'
                    >
                        <Plus size={18} />
                        <span>Add New Pet</span>
                    </button>
                </div>

                {/* Main Pets Grid */}
                {loading ? (
                    <div className='rounded-xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-600'>
                        Loading pet profiles...
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {pets.map((pet) => (
                            <article
                                key={pet._id}
                                className='group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300'
                            >
                                <div className='flex items-start gap-4'>
                                    {/* Prominent Pet Profile Picture */}
                                    <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                                        {pet.photoUrl ? (
                                            <img
                                                src={pet.photoUrl}
                                                alt={pet.name}
                                                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                                            />
                                        ) : (
                                            <div className='flex h-full w-full flex-col items-center justify-center text-slate-400'>
                                                {pet.type === 'cat' ? <Cat size={28} /> : <Dog size={28} />}
                                                <span className='mt-0.5 text-[9px] font-semibold uppercase tracking-wider'>No Photo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pet Info */}
                                    <div className='min-w-0 flex-1'>
                                        <div className='flex items-center justify-between gap-2'>
                                            <span className='inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C25E2B]'>
                                                {pet.type === 'cat' ? 'Cat' : 'Dog'}
                                            </span>
                                            <div className='flex items-center gap-1'>
                                                <button
                                                    onClick={() => openEdit(pet)}
                                                    className='grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
                                                    title='Edit Pet Profile'
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeletePet(pet)}
                                                    className='grid h-7 w-7 place-items-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50 hover:border-red-300'
                                                    title='Remove Pet'
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <h2 className='mt-1 truncate font-serif text-xl font-bold text-slate-900'>
                                            {pet.name}
                                        </h2>
                                        <p className='truncate text-xs font-medium text-slate-600'>
                                            {pet.breed}
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Specs & Badges */}
                                <div className='mt-4 flex flex-wrap gap-2 text-xs'>
                                    {pet.coatType && (
                                        <span className='rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-800'>
                                            Coat: <span className='font-semibold'>{pet.coatType}</span>
                                        </span>
                                    )}
                                    {pet.ageMonths !== undefined && pet.ageMonths !== null && (
                                        <span className='rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-800'>
                                            {pet.ageMonths} mo old
                                        </span>
                                    )}
                                    <span className={`rounded-md px-2.5 py-1 font-medium ${pet.vaccinated === false ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                                        {pet.vaccinated === false ? 'Unvaccinated' : 'Fully Vaccinated'}
                                    </span>
                                </div>

                                {pet.notes && (
                                    <div className='mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600'>
                                        <span className='font-semibold text-slate-900'>Notes: </span>
                                        {pet.notes}
                                    </div>
                                )}
                            </article>
                        ))}

                        {/* Empty State */}
                        {!pets.length && (
                            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center md:col-span-2 lg:col-span-3'>
                                <div className='grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-[#C25E2B]'>
                                    <Dog size={28} />
                                </div>
                                <h2 className='mt-4 font-serif text-xl font-bold text-slate-900'>No Pet Profiles Saved</h2>
                                <p className='mt-1 max-w-sm text-sm text-slate-600'>
                                    Add your pets to upload their pictures and book grooming appointments effortlessly.
                                </p>
                                <button
                                    onClick={openNew}
                                    className='mt-5 inline-flex items-center gap-2 rounded-lg bg-[#C25E2B] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#A84E20]'
                                >
                                    <Plus size={15} />
                                    <span>Add Your First Pet</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pet Form Modal */}
            {open && (
                <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto'>
                    <form
                        onSubmit={save}
                        className='relative w-full max-w-lg rounded-t-2xl sm:rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto pb-safe'
                    >
                        <div className='mb-6 flex items-center justify-between border-b border-slate-200 pb-4'>
                            <h2 className='font-serif text-xl font-bold text-slate-900'>
                                {editingId ? 'Edit Pet Profile' : 'Add New Pet'}
                            </h2>
                            <button
                                type='button'
                                onClick={() => setOpen(false)}
                                className='grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* Pet Photo Upload Header */}
                        <div className='mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
                            <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white'>
                                {form.photoUrl ? (
                                    <img src={form.photoUrl} alt='Pet preview' className='h-full w-full object-cover' />
                                ) : (
                                    <div className='flex h-full w-full items-center justify-center text-slate-400'>
                                        <Camera size={24} />
                                    </div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <label className='inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:border-[#C25E2B] hover:text-[#C25E2B]'>
                                    <Upload size={14} />
                                    <span>{form.photoUrl ? 'Change Pet Photo' : 'Upload Pet Photo'}</span>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handlePhotoChange}
                                        className='hidden'
                                    />
                                </label>
                                <p className='mt-1 text-[11px] text-slate-500'>
                                    Official picture for your pet. JPG, PNG or WEBP up to 8MB.
                                </p>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Pet Name' placeholder='e.g. Milo' value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                                <label className='block'>
                                    <FieldLabel>Pet Type</FieldLabel>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className='h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20'
                                    >
                                        <option value='dog'>Dog</option>
                                        <option value='cat'>Cat</option>
                                    </select>
                                </label>
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Breed' placeholder='e.g. Shih Tzu, Golden Retriever' value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} />
                                <Field label='Coat Type (Optional)' placeholder='e.g. Double coat, Long hair' value={form.coatType} onChange={(v) => setForm({ ...form, coatType: v })} required={false} />
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Age (Months)' type='number' min='0' placeholder='e.g. 12' value={form.ageMonths} onChange={(v) => setForm({ ...form, ageMonths: v })} required={false} />
                                <label className='block'>
                                    <FieldLabel>Vaccination Status</FieldLabel>
                                    <select
                                        value={form.vaccinated}
                                        onChange={(e) => setForm({ ...form, vaccinated: e.target.value })}
                                        className='h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20'
                                    >
                                        <option value='yes'>Yes - Fully Vaccinated</option>
                                        <option value='no'>No - Not Fully Vaccinated</option>
                                    </select>
                                </label>
                            </div>

                            <label className='block'>
                                <FieldLabel>Care Notes / Special Instructions (Optional)</FieldLabel>
                                <textarea
                                    value={form.notes}
                                    placeholder='e.g. Sensitive skin, prefers low blow-dry speed'
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    className='w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'
                                />
                            </label>
                        </div>

                        <div className='mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4'>
                            <button
                                type='button'
                                onClick={() => setOpen(false)}
                                className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100'
                            >
                                Cancel
                            </button>
                            <button
                                disabled={saving}
                                className='rounded-lg bg-[#C25E2B] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#A84E20] disabled:opacity-60'
                            >
                                {saving ? 'Saving Profile...' : 'Save Pet Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={Boolean(confirmDeletePet)}
                title='Delete Pet Profile'
                description={confirmDeletePet
                    ? `Are you sure you want to remove ${confirmDeletePet.name}? This will remove the pet profile from your account.`
                    : ''}
                confirmText='Delete Pet'
                cancelText='Keep Pet'
                variant='danger'
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setConfirmDeletePet(null)}
            />
        </div>
    )
}

function FieldLabel({ children }) {
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>{children}</span>
}

function Field({ label, value, onChange, placeholder, required = true, ...props }) {
    return (
        <label className='block'>
            <FieldLabel>{label}</FieldLabel>
            <input
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className='h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'
                {...props}
            />
        </label>
    )
}
