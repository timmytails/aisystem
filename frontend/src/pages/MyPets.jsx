import { useEffect, useState } from 'react'
import { PawPrint, Pencil, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage, petsApi } from '../utils/api'
import ConfirmModal from '../components/ConfirmModal'

const emptyPet = { name: '', type: 'dog', breed: '', coatType: '', notes: '', ageMonths: '', vaccinated: 'yes' }

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

    const openNew = () => { setEditingId(''); setForm(emptyPet); setOpen(true) }
    const openEdit = (pet) => {
        setEditingId(pet._id)
        setForm({
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            coatType: pet.coatType || '',
            notes: pet.notes || '',
            ageMonths: pet.ageMonths !== undefined && pet.ageMonths !== null ? String(pet.ageMonths) : '',
            vaccinated: pet.vaccinated === false ? 'no' : 'yes'
        })
        setOpen(true)
    }

    const save = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingId) await petsApi.update(editingId, form)
            else await petsApi.create(form)
            toast.success(editingId ? 'Pet updated' : 'Pet added')
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
        <div className='min-h-screen bg-[#fbf7f1] px-5 py-12 text-[#201711]'>
            <div className='mx-auto max-w-6xl'>

                {/* Header */}
                <div className='mb-8 flex flex-col justify-between gap-5 border-b border-[#e8ddd0] pb-6 sm:flex-row sm:items-end'>
                    <div>
                        <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                            Companion Profiles
                        </span>
                        <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl'>My Pets</h1>
                        <p className='mt-1.5 text-sm text-[#765b49]'>
                            Save your pet profiles to make appointment bookings quick and easy.
                        </p>
                    </div>
                    <button
                        onClick={openNew}
                        className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#bf5a31] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a94723] active:scale-[0.98]'
                    >
                        <Plus size={17} />
                        Add New Pet
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className='rounded-2xl border border-[#e8ddd0] bg-white p-10 text-center text-sm font-medium text-[#9c7b68]'>
                        Loading your saved pets...
                    </div>
                ) : (
                    <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                        {pets.map((pet) => (
                            <article
                                key={pet._id}
                                className='group relative overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-xs transition hover:border-[#bf5a31]/40 hover:shadow-md'
                            >
                                {/* Left accent bar */}
                                <span className='absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#1c3329]' />

                                <div className='flex items-start justify-between gap-4'>
                                    <div className='flex items-start gap-3.5'>
                                        {/* Avatar */}
                                        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1c3329] font-bold text-white text-lg'>
                                            {pet.name?.[0]?.toUpperCase() ?? '?'}
                                        </span>
                                        <div>
                                            <span className='inline-block rounded-full border border-[#e8d2c2] bg-[#f6ede2] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#bf5a31]'>
                                                {pet.type === 'cat' ? 'Cat' : 'Dog'}
                                            </span>
                                            <h2 className='mt-1.5 font-serif text-xl font-bold text-[#201711]'>{pet.name}</h2>
                                            <p className='text-xs font-medium text-[#765b49]'>{pet.breed}</p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className='flex shrink-0 gap-2'>
                                        <button
                                            onClick={() => openEdit(pet)}
                                            className='grid h-8 w-8 place-items-center rounded-lg border border-[#e8ddd0] bg-white text-[#4e382b] transition hover:border-[#bf5a31] hover:text-[#bf5a31]'
                                            aria-label='Edit pet'
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeletePet(pet)}
                                            className='grid h-8 w-8 place-items-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 hover:border-red-300'
                                            aria-label='Remove pet'
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {pet.coatType && (
                                    <p className='mt-4 text-xs font-semibold text-[#8d7565]'>
                                        Coat: <span className='text-[#4e382b]'>{pet.coatType}</span>
                                    </p>
                                )}
                                <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                                    {pet.ageMonths !== undefined && pet.ageMonths !== null && (
                                        <span className={`rounded-full px-2.5 py-0.5 font-semibold ${pet.ageMonths < 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                            {pet.ageMonths} mo old {pet.ageMonths < 3 ? '(Under 3 mo)' : ''}
                                        </span>
                                    )}
                                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${pet.vaccinated === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                                        {pet.vaccinated === false ? 'Unvaccinated' : 'Fully Vaccinated'}
                                    </span>
                                </div>
                                {pet.notes && (
                                    <p className='mt-2 rounded-lg border border-[#eaddd0] bg-[#faf6f0] px-3 py-2 text-xs italic leading-relaxed text-[#806654]'>
                                        &ldquo;{pet.notes}&rdquo;
                                    </p>
                                )}
                            </article>
                        ))}

                        {/* Empty state */}
                        {!pets.length && (
                            <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfcfbd] bg-white p-12 text-center md:col-span-2 lg:col-span-3'>
                                <span className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#1c3329] text-white'>
                                    <PawPrint size={28} />
                                </span>
                                <h2 className='mt-5 font-serif text-2xl font-bold text-[#201711]'>No Saved Pets Yet</h2>
                                <p className='mt-2 max-w-sm text-sm leading-6 text-[#765b49]'>
                                    Add your pet&apos;s details to streamline appointment bookings and visualize personalized haircut styles.
                                </p>
                                <button
                                    onClick={openNew}
                                    className='mt-6 inline-flex items-center gap-2 rounded-xl bg-[#bf5a31] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#a94723]'
                                >
                                    <Plus size={15} />
                                    Add Your First Pet
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pet Form Modal */}
            {open && (
                <div
                    className='fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4'
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
                >
                    <form
                        onSubmit={save}
                        className='w-full max-w-xl rounded-2xl border border-[#e0d3c3] bg-white p-7 shadow-xl sm:p-9'
                    >
                        <div className='mb-6 flex items-center justify-between border-b border-[#e8ddd0] pb-4'>
                            <h2 className='font-serif text-2xl font-bold text-[#201711]'>
                                {editingId ? 'Edit Pet Profile' : 'Add New Pet'}
                            </h2>
                            <button
                                type='button'
                                onClick={() => setOpen(false)}
                                className='grid h-9 w-9 place-items-center rounded-xl border border-[#e8ddd0] text-[#4e382b] transition hover:bg-[#f6ede2] hover:text-[#bf5a31]'
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className='space-y-4'>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Pet Name' placeholder='e.g. Milo' value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                                <label className='block'>
                                    <FieldLabel>Pet Type</FieldLabel>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className='h-11 w-full rounded-xl border border-[#e0d3c3] px-4 text-sm outline-none focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                                    >
                                        <option value='dog'>Dog</option>
                                        <option value='cat'>Cat</option>
                                    </select>
                                </label>
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Breed' placeholder='e.g. Golden Retriever' value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} />
                                <Field label='Coat Type (Optional)' placeholder='e.g. Double coat' value={form.coatType} onChange={(v) => setForm({ ...form, coatType: v })} required={false} />
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Pet Age (Months)' type='number' min='0' placeholder='e.g. 6' value={form.ageMonths} onChange={(v) => setForm({ ...form, ageMonths: v })} required={false} />
                                <label className='block'>
                                    <FieldLabel>Fully Vaccinated?</FieldLabel>
                                    <select
                                        value={form.vaccinated}
                                        onChange={(e) => setForm({ ...form, vaccinated: e.target.value })}
                                        className='h-11 w-full rounded-xl border border-[#e0d3c3] px-4 text-sm outline-none focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                                    >
                                        <option value='yes'>Yes - Fully Vaccinated</option>
                                        <option value='no'>No - Not Vaccinated</option>
                                    </select>
                                </label>
                            </div>

                            <label className='block'>
                                <FieldLabel>Special Notes / Care Instructions (Optional)</FieldLabel>
                                <textarea
                                    value={form.notes}
                                    placeholder='e.g. Sensitive ears, prefers soft dryer speed'
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    className='w-full rounded-xl border border-[#e0d3c3] px-4 py-3 text-sm outline-none transition focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10 placeholder:text-[#b5a090]'
                                />
                            </label>
                        </div>

                        <button
                            disabled={saving}
                            className='mt-6 h-12 w-full rounded-xl bg-[#bf5a31] font-bold text-white shadow-xs transition hover:bg-[#a94723] active:scale-[0.98] disabled:opacity-60'
                        >
                            {saving ? 'Saving...' : 'Save Pet Profile'}
                        </button>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={Boolean(confirmDeletePet)}
                title='Delete Pet Profile'
                description={confirmDeletePet
                    ? `Are you sure you want to remove ${confirmDeletePet.name} from your profiles? This cannot be undone.`
                    : ''}
                confirmText='Yes, Delete Pet'
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
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{children}</span>
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
                className='h-11 w-full rounded-xl border border-[#e0d3c3] px-4 text-sm outline-none transition focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10 placeholder:text-[#b5a090]'
                {...props}
            />
        </label>
    )
}
