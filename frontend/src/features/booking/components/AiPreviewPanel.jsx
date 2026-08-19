import { useState } from 'react'
import {
    CheckCircle2,
    CloudRain,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    SunMedium,
    Upload,
    Wind
} from 'lucide-react'

export default function AiPreviewPanel({
    season,
    photoPreview,
    onPhotoChange,
    generatedPreview,
    selectedStyleName,
    previewFromCache,
    consent,
    onConsentChange,
    verificationStatus,
    galleryGenerating,
    galleryMessage,
    hasFailures,
    onRetryFailures,
    onRegenerateSelected,
    children
}) {
    const SeasonIcon = season?.key === 'hot-dry'
        ? SunMedium
        : season?.key === 'wet-rainy'
            ? CloudRain
            : Wind

    const [compareMode, setCompareMode] = useState('ai')

    return (
        <div className='space-y-7'>
            <div className='flex items-start gap-4 rounded-2xl border border-[#dce9e1] bg-[#f2f8f4] p-4 sm:p-5'>
                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#24523f] shadow-sm'>
                    <SeasonIcon size={21} />
                </span>
                <div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-serif text-lg font-bold text-[#1f4536]'>{season?.label || 'Seasonal recommendations'}</p>
                        {season?.months && (
                            <span className='rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#537162]'>{season.months}</span>
                        )}
                    </div>
                    <p className='mt-1 text-sm leading-6 text-[#587064]'>{season?.advice || 'Recommended styles are ordered for the current Philippine season.'}</p>
                </div>
            </div>

            <section>
                <div className='mb-4'>
                    <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#a94723]'>Start here</p>
                    <h3 className='mt-1 font-serif text-xl font-bold'>Upload your pet’s photo</h3>
                    <p className='mt-1 text-sm text-[#806654]'>One clear photo creates the top suggestion first; other styles generate only when selected.</p>
                </div>

                <div className='grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(290px,0.8fr)]'>
                    <label className='flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d9c6b2] bg-white text-center transition hover:border-[#b97b59] focus-within:ring-2 focus-within:ring-[#a84522] focus-within:ring-offset-2'>
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt='Uploaded pet before grooming'
                                className='h-56 w-full object-contain'
                            />
                        ) : (
                            <>
                                <span className='grid h-12 w-12 place-items-center rounded-full bg-[#f3e8dc] text-[#a94723]'>
                                    <Upload size={22} />
                                </span>
                                <strong className='mt-3'>Choose a clear pet photo</strong>
                                <span className='mt-1.5 text-xs text-[#806654]'>Front or three-quarter view · JPG, PNG, or WEBP · maximum 7 MB</span>
                            </>
                        )}
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            onChange={onPhotoChange}
                            className='sr-only'
                        />
                    </label>

                    <div className='flex flex-col justify-center rounded-2xl border border-[#e5d6c5] bg-white p-5'>
                        <p className='font-serif text-lg font-bold'>For a clearer comparison</p>
                        <ul className='mt-2 space-y-1.5 text-sm leading-6 text-[#765f50]'>
                            <li>• Show one pet as the main subject.</li>
                            <li>• Include the face and as much of the body as possible.</li>
                            <li>• Use bright, even lighting without heavy blur.</li>
                        </ul>

                        <label className='mt-4 flex items-start gap-3 rounded-xl bg-[#f8f3ed] p-3.5 text-sm text-[#6f5544]'>
                            <input
                                type='checkbox'
                                checked={consent}
                                onChange={(event) => onConsentChange(event.target.checked)}
                                className='mt-1 h-4 w-4 accent-[#b84c25]'
                            />
                            <span>I agree to securely process this photo for personalized grooming previews.</span>
                        </label>

                        <div className='mt-3 min-h-11 rounded-xl border border-[#eadfce] px-3.5 py-2.5 text-xs' aria-live='polite'>
                            {verificationStatus === 'checking' ? (
                                <span className='flex items-center gap-2 text-[#315c49]' role='status'><Loader2 size={15} className='animate-spin' />Checking your pet photo once…</span>
                            ) : verificationStatus === 'verified' ? (
                                <span className='flex items-center gap-2 font-semibold text-[#24523f]'><CheckCircle2 size={15} />Photo verified for all styles.</span>
                            ) : verificationStatus === 'error' ? (
                                <span className='text-[#9c4424]'>Photo verification failed. Replace the photo or try again.</span>
                            ) : photoPreview && !consent ? (
                                <span className='text-[#806654]'>Accept photo processing to begin.</span>
                            ) : (
                                <span className='text-[#806654]'>The top suggestion starts after upload and consent.</span>
                            )}
                        </div>
                    </div>
                </div>

                {photoPreview && (
                    <p className='mt-2 text-xs text-[#806654]'>Choose the photo area again to replace it. Replacing the photo clears the current gallery.</p>
                )}
            </section>

            <div className='border-t border-[#eadfce] pt-7'>
                <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]'>
                    <div className='min-w-0'>
                        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                            <div>
                                <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#a94723]'>Personalized gallery</p>
                                <p className='mt-1 text-sm text-[#806654]'>Completed cards use your uploaded pet—not a stock style photo.</p>
                            </div>
                            {galleryGenerating && (
                                <span className='flex items-center gap-2 rounded-full bg-[#eef6f1] px-4 py-2 text-xs font-semibold text-[#24523f]' role='status'><Loader2 size={14} className='animate-spin' />{galleryMessage || 'Creating your style choices…'}</span>
                            )}
                            {!galleryGenerating && hasFailures && (
                                <button type='button' onClick={onRetryFailures} className='inline-flex items-center gap-2 rounded-full border border-[#d8c3af] px-4 py-2 text-xs font-bold text-[#8b4b2c] transition hover:border-[#b97b59] hover:bg-white'><RefreshCw size={14} />Retry next unfinished style</button>
                            )}
                        </div>
                        {children}
                    </div>

                    <aside className='sticky top-24 hidden overflow-hidden rounded-2xl border border-[#ddcdbd] bg-white shadow-sm xl:block'>
                        <div className='flex items-center justify-between gap-3 border-b border-[#eadfce] px-5 py-4'>
                            <div>
                                <p className='text-[10px] font-bold uppercase tracking-[0.17em] text-[#a94723]'>Groomer reference</p>
                                <h3 className='mt-1 font-serif text-xl font-bold'>Selected preview</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                {selectedStyleName && (
                                    <span className='rounded-full bg-[#eef6f1] px-3 py-1 text-[10px] font-bold text-[#24523f]'>{selectedStyleName}</span>
                                )}
                                {generatedPreview && onRegenerateSelected && (
                                    <button
                                        type='button'
                                        onClick={onRegenerateSelected}
                                        disabled={galleryGenerating}
                                        className='inline-flex items-center gap-1.5 rounded-full border border-[#d8c3af] bg-white px-3 py-1 text-[11px] font-bold text-[#8b4b2c] transition hover:border-[#b97b59] hover:bg-[#fff9f5] disabled:opacity-50'
                                        title='Re-run AI generation for this style'
                                    >
                                        <RefreshCw size={12} className={galleryGenerating ? 'animate-spin' : ''} />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                        </div>

                        {generatedPreview && photoPreview && (
                            <div className='flex items-center justify-center border-b border-[#eadfce] bg-[#f8f3ed] p-2'>
                                <div className='inline-flex rounded-xl bg-white p-1 shadow-sm border border-[#e5d6c5]'>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('ai')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'ai' ? 'bg-[#bf5a31] text-white' : 'text-[#765f50] hover:text-[#24523f]'}`}
                                    >
                                        AI Groomed
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('original')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'original' ? 'bg-[#bf5a31] text-white' : 'text-[#765f50] hover:text-[#24523f]'}`}
                                    >
                                        Original Pet
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('split')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'split' ? 'bg-[#bf5a31] text-white' : 'text-[#765f50] hover:text-[#24523f]'}`}
                                    >
                                        Side-by-Side
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className='flex min-h-80 items-center justify-center bg-[#fbf8f4]' aria-live='polite'>
                            {generatedPreview ? (
                                <div className='relative w-full'>
                                    {compareMode === 'split' && photoPreview ? (
                                        <div className='grid grid-cols-2 gap-1 p-2'>
                                            <div className='relative overflow-hidden rounded-xl border border-[#e5d6c5] bg-white'>
                                                <img src={photoPreview} alt='Original Pet' className='h-60 w-full object-cover' />
                                                <span className='absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white'>Original</span>
                                            </div>
                                            <div className='relative overflow-hidden rounded-xl border border-[#e5d6c5] bg-white'>
                                                <img src={generatedPreview} alt='AI Groomed Cut' className='h-60 w-full object-cover' />
                                                <span className='absolute bottom-2 left-2 rounded-full bg-[#bf5a31] px-2 py-0.5 text-[9px] font-bold text-white'>AI Cut</span>
                                            </div>
                                        </div>
                                    ) : compareMode === 'original' && photoPreview ? (
                                        <div className='relative w-full'>
                                            <img src={photoPreview} alt='Original Pet' className='max-h-[31rem] w-full object-contain' />
                                            <span className='absolute bottom-3 left-3 rounded-full bg-[#234638] px-3 py-1.5 text-[9px] font-bold text-white'>Original pet photo</span>
                                        </div>
                                    ) : (
                                        <div className='relative w-full'>
                                            <img
                                                src={generatedPreview}
                                                alt={`Personalized grooming preview${selectedStyleName ? ` showing ${selectedStyleName}` : ''}`}
                                                className='max-h-[31rem] w-full object-contain'
                                            />
                                            {previewFromCache && (
                                                <span className='absolute bottom-3 left-3 rounded-full bg-[#234638] px-3 py-1.5 text-[9px] font-bold text-white'>Saved preview</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='px-8 text-center text-[#806654]'>
                                    <ImageIcon size={34} className='mx-auto mb-3' />
                                    <p className='text-sm'>{galleryGenerating ? 'Recommended images are being prepared. Select one as soon as it appears.' : 'Select a finished style to show it here.'}</p>
                                </div>
                            )}
                        </div>

                        {photoPreview && (
                            <div className='flex items-center gap-3 border-t border-[#eadfce] p-4'>
                                <img src={photoPreview} alt='Original uploaded pet reference' className='h-14 w-14 rounded-xl border border-[#e5d6c5] object-cover' />
                                <div>
                                    <p className='text-xs font-bold text-[#5f4c3f]'>Original pet photo</p>
                                    <p className='mt-0.5 text-[10px] leading-4 text-[#806654]'>Compare identity, markings, and coat color.</p>
                                </div>
                            </div>
                        )}

                        <p className='border-t border-[#eadfce] px-5 py-3 text-[10px] leading-4 text-[#765f50]'>Visual guide only. The groomer confirms the safest achievable result.</p>
                    </aside>
                </div>
            </div>
        </div>
    )
}
