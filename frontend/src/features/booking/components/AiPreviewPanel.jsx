import { useState } from 'react'
import {
    CheckCircle2,
    CloudRain,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    SunMedium,
    Upload,
    WandSparkles,
    Wind,
    X
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
    const [showCompareModal, setShowCompareModal] = useState(false)

    return (
        <div className='space-y-6'>
            <div className='flex items-start sm:items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm'>
                <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#C25E2B] border border-slate-200'>
                    <SeasonIcon size={18} />
                </span>
                <div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-serif text-sm sm:text-base font-bold text-slate-900'>{season?.label || 'Seasonal recommendations'}</p>
                        {season?.months && (
                            <span className='rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700'>{season.months}</span>
                        )}
                    </div>
                    <p className='mt-0.5 text-xs text-slate-600 leading-relaxed'>{season?.advice || 'Recommended styles are ordered for the current Philippine season.'}</p>
                </div>
            </div>

            <section>
                <div className='mb-3'>
                    <p className='text-[10px] font-bold uppercase tracking-wider text-[#C25E2B]'>Start here</p>
                    <h3 className='mt-0.5 font-serif text-lg sm:text-xl font-bold text-slate-900'>Upload your pet’s photo</h3>
                    <p className='mt-0.5 text-xs text-slate-600'>One clear photo creates the top suggestion first; other styles generate only when selected.</p>
                </div>

                <div className='grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(290px,0.8fr)]'>
                    <div className='relative flex min-h-44 sm:min-h-56 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white text-center transition hover:border-[#C25E2B]'>
                        {photoPreview ? (
                            <div className='relative h-44 sm:h-56 w-full group'>
                                <img
                                    src={photoPreview}
                                    alt='Uploaded pet before grooming'
                                    className='h-44 sm:h-56 w-full object-contain p-2'
                                />
                                <label className='absolute bottom-2.5 right-2.5 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#C25E2B] shadow-xs transition hover:bg-[#C25E2B] hover:text-white'>
                                    <Upload size={13} />
                                    <span>Change Photo</span>
                                    <input
                                        type='file'
                                        accept='image/jpeg,image/png,image/webp'
                                        onChange={onPhotoChange}
                                        className='sr-only'
                                    />
                                </label>
                            </div>
                        ) : (
                            <label className='flex h-44 sm:h-56 w-full cursor-pointer flex-col items-center justify-center p-3 sm:p-4'>
                                <span className='grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-slate-100 text-[#C25E2B] border border-slate-200'>
                                    <Upload size={20} />
                                </span>
                                <strong className='mt-2 text-xs sm:text-sm text-slate-900'>Choose a clear pet photo</strong>
                                <span className='mt-1 text-[11px] sm:text-xs text-slate-500'>Front or 3/4 view · JPG, PNG, WEBP · max 7 MB</span>
                                <input
                                    type='file'
                                    accept='image/jpeg,image/png,image/webp'
                                    onChange={onPhotoChange}
                                    className='sr-only'
                                />
                            </label>
                        )}
                    </div>

                    <div className='flex flex-col justify-center rounded-xl border border-[#e5d6c5] bg-white p-3.5 sm:p-5'>
                        <p className='font-serif text-base sm:text-lg font-bold'>For a clearer comparison</p>
                        <ul className='mt-1.5 space-y-1 text-xs text-[#765f50] leading-relaxed'>
                            <li>• Show one pet as the main subject.</li>
                            <li>• Include face and body clearly.</li>
                            <li>• Use bright, even lighting without heavy blur.</li>
                        </ul>

                        <label className='mt-3 flex items-start gap-2.5 rounded-lg bg-[#f8f3ed] p-3 text-xs text-[#6f5544]'>
                            <input
                                type='checkbox'
                                checked={consent}
                                onChange={(event) => onConsentChange(event.target.checked)}
                                className='mt-0.5 h-4 w-4 accent-[#b84c25]'
                            />
                            <span>I agree to securely process this photo for personalized grooming previews.</span>
                        </label>

                        <div className='mt-2.5 min-h-10 rounded-lg border border-[#eadfce] px-3 py-2 text-xs' aria-live='polite'>
                            {verificationStatus === 'checking' ? (
                                <span className='flex items-center gap-2 text-[#315c49]' role='status'><Loader2 size={14} className='animate-spin' />Checking your pet photo once…</span>
                            ) : verificationStatus === 'verified' ? (
                                <span className='flex items-center gap-2 font-semibold text-[#24523f]'><CheckCircle2 size={14} />Photo verified for all styles.</span>
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

                    <aside id='ai-preview-comparison-card' className='block overflow-hidden rounded-2xl border border-[#E2D9C8] bg-white shadow-xs xl:sticky xl:top-24'>
                        <div className='flex items-center justify-between gap-3 border-b border-[#E2D9C8] px-5 py-4'>
                            <div>
                                <p className='text-[10px] font-bold uppercase tracking-wider text-[#C25E2B]'>Groomer Reference</p>
                                <h3 className='mt-0.5 font-serif text-lg font-bold text-[#261C14] sm:text-xl'>Selected Preview</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                {selectedStyleName && (
                                    <span className='rounded-full bg-[#2B4C3F]/10 px-3 py-1 text-[10px] font-bold text-[#2B4C3F]'>{selectedStyleName}</span>
                                )}
                                {generatedPreview && onRegenerateSelected && (
                                    <button
                                        type='button'
                                        onClick={onRegenerateSelected}
                                        disabled={galleryGenerating}
                                        className='inline-flex items-center gap-1.5 rounded-full border border-[#E2D9C8] bg-white px-3 py-1 text-[11px] font-bold text-[#C25E2B] transition hover:bg-[#FAF7F2] disabled:opacity-50'
                                        title='Re-run AI generation for this style'
                                    >
                                        <RefreshCw size={12} className={galleryGenerating ? 'animate-spin' : ''} />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                        </div>

                        {generatedPreview && photoPreview && (
                            <div className='flex items-center justify-center border-b border-[#E2D9C8] bg-[#FAF7F2] p-2'>
                                <div className='inline-flex rounded-xl bg-white p-1 shadow-xs border border-[#E2D9C8]'>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('ai')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'ai' ? 'bg-[#C25E2B] text-white' : 'text-[#68594E] hover:text-[#261C14]'}`}
                                    >
                                        AI Groomed
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('original')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'original' ? 'bg-[#C25E2B] text-white' : 'text-[#68594E] hover:text-[#261C14]'}`}
                                    >
                                        Original Pet
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setCompareMode('split')}
                                        className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${compareMode === 'split' ? 'bg-[#C25E2B] text-white' : 'text-[#68594E] hover:text-[#261C14]'}`}
                                    >
                                        Side-by-Side
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className='flex min-h-64 sm:min-h-80 items-center justify-center bg-[#FAF7F2]' aria-live='polite'>
                            {generatedPreview ? (
                                <div className='relative w-full'>
                                    {compareMode === 'split' && photoPreview ? (
                                        <div className='grid grid-cols-2 gap-1.5 p-2'>
                                            <div className='relative overflow-hidden rounded-xl border border-[#E2D9C8] bg-white'>
                                                <img src={photoPreview} alt='Original Pet' className='h-48 sm:h-60 w-full object-cover' />
                                                <span className='absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white'>Original</span>
                                            </div>
                                            <div className='relative overflow-hidden rounded-xl border border-[#E2D9C8] bg-white'>
                                                <img src={generatedPreview} alt='AI Groomed Cut' className='h-48 sm:h-60 w-full object-cover' />
                                                <span className='absolute bottom-2 left-2 rounded-full bg-[#C25E2B] px-2 py-0.5 text-[9px] font-bold text-white'>AI Cut</span>
                                            </div>
                                        </div>
                                    ) : compareMode === 'original' && photoPreview ? (
                                        <div className='relative w-full'>
                                            <img src={photoPreview} alt='Original Pet' className='max-h-[26rem] sm:max-h-[31rem] w-full object-contain' />
                                            <span className='absolute bottom-3 left-3 rounded-full bg-[#2B4C3F] px-3 py-1.5 text-[9px] font-bold text-white'>Original pet photo</span>
                                        </div>
                                    ) : (
                                        <div className='relative w-full'>
                                            <img
                                                src={generatedPreview}
                                                alt={`Personalized grooming preview${selectedStyleName ? ` showing ${selectedStyleName}` : ''}`}
                                                className='max-h-[26rem] sm:max-h-[31rem] w-full object-contain'
                                            />
                                            {previewFromCache && (
                                                <span className='absolute bottom-3 left-3 rounded-full bg-[#2B4C3F] px-3 py-1.5 text-[9px] font-bold text-white'>Saved preview</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='px-6 py-8 text-center text-[#8C7A6D]'>
                                    <ImageIcon size={32} className='mx-auto mb-2 text-[#C25E2B]' />
                                    <p className='text-xs sm:text-sm font-medium'>{galleryGenerating ? 'Recommended images are being prepared. Select one as soon as it appears.' : 'Select a finished style to show it here.'}</p>
                                </div>
                            )}
                        </div>

                        {photoPreview && (
                            <div className='flex items-center gap-3 border-t border-[#E2D9C8] p-3.5 sm:p-4'>
                                <img src={photoPreview} alt='Original uploaded pet reference' className='h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-[#E2D9C8] object-cover' />
                                <div>
                                    <p className='text-xs font-bold text-[#261C14]'>Original pet photo</p>
                                    <p className='mt-0.5 text-[10px] leading-4 text-[#68594E]'>Compare identity, markings, and coat color.</p>
                                </div>
                            </div>
                        )}

                        <p className='border-t border-[#E2D9C8] px-4 py-2.5 text-[10px] leading-4 text-[#8C7A6D]'>Visual guide only. The groomer confirms the safest achievable result.</p>
                    </aside>
                </div>
            </div>

            {/* Floating Mobile Comparison Button */}
            {generatedPreview && photoPreview && (
                <button
                    type='button'
                    onClick={() => setShowCompareModal(true)}
                    className='fixed bottom-36 right-3 z-30 flex items-center gap-2 rounded-full border border-[#E2D9C8] bg-[#2B4C3F] px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md transition hover:bg-[#1f372d] active:scale-95 lg:hidden'
                >
                    <span className='grid h-5 w-5 place-items-center rounded-full bg-white/20 text-white'>
                        <WandSparkles size={12} />
                    </span>
                    <span>Compare Result</span>
                </button>
            )}

            {/* Mobile Comparison Bottom Sheet Modal */}
            {showCompareModal && generatedPreview && photoPreview && (
                <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs lg:hidden p-0 sm:p-4'>
                    <div className='w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-[#E2D9C8] bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200'>
                        <div className='flex items-center justify-between border-b border-[#E2D9C8] pb-3 mb-4'>
                            <div>
                                <span className='text-[10px] font-bold uppercase tracking-wider text-[#C25E2B]'>AI Style Comparison</span>
                                <h3 className='font-serif text-lg font-bold text-[#261C14]'>{selectedStyleName || 'Grooming Preview'}</h3>
                            </div>
                            <button
                                type='button'
                                onClick={() => setShowCompareModal(false)}
                                className='grid h-8 w-8 place-items-center rounded-full bg-[#FAF7F2] text-[#68594E] hover:bg-[#E2D9C8]'
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className='flex items-center justify-center mb-4'>
                            <div className='inline-flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E2D9C8]'>
                                <button
                                    type='button'
                                    onClick={() => setCompareMode('split')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${compareMode === 'split' ? 'bg-[#C25E2B] text-white shadow-xs' : 'text-[#68594E]'}`}
                                >
                                    Side-by-Side
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setCompareMode('ai')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${compareMode === 'ai' ? 'bg-[#C25E2B] text-white shadow-xs' : 'text-[#68594E]'}`}
                                >
                                    AI Cut
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setCompareMode('original')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${compareMode === 'original' ? 'bg-[#C25E2B] text-white shadow-xs' : 'text-[#68594E]'}`}
                                >
                                    Original
                                </button>
                            </div>
                        </div>

                        {/* Image Preview Container */}
                        <div className='rounded-xl border border-[#E2D9C8] bg-[#FAF7F2] p-2 overflow-hidden mb-4'>
                            {compareMode === 'split' ? (
                                <div className='grid grid-cols-2 gap-2'>
                                    <div className='relative overflow-hidden rounded-lg border border-[#E2D9C8] bg-white'>
                                        <img src={photoPreview} alt='Original Pet' className='h-52 w-full object-cover' />
                                        <span className='absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white'>Original</span>
                                    </div>
                                    <div className='relative overflow-hidden rounded-lg border border-[#E2D9C8] bg-white'>
                                        <img src={generatedPreview} alt='AI Groomed Cut' className='h-52 w-full object-cover' />
                                        <span className='absolute bottom-2 left-2 rounded-full bg-[#C25E2B] px-2 py-0.5 text-[9px] font-bold text-white'>AI Cut</span>
                                    </div>
                                </div>
                            ) : compareMode === 'original' ? (
                                <div className='relative w-full overflow-hidden rounded-lg border border-[#E2D9C8] bg-white'>
                                    <img src={photoPreview} alt='Original Pet' className='max-h-72 w-full object-contain' />
                                    <span className='absolute bottom-2 left-2 rounded-full bg-[#2B4C3F] px-2.5 py-1 text-[10px] font-bold text-white'>Original Pet</span>
                                </div>
                            ) : (
                                <div className='relative w-full overflow-hidden rounded-lg border border-[#E2D9C8] bg-white'>
                                    <img src={generatedPreview} alt='AI Cut Preview' className='max-h-72 w-full object-contain' />
                                    <span className='absolute bottom-2 left-2 rounded-full bg-[#C25E2B] px-2.5 py-1 text-[10px] font-bold text-white'>AI Groomed Cut</span>
                                </div>
                            )}
                        </div>

                        <p className='text-[11px] text-[#8C7A6D] text-center mb-4 leading-relaxed'>
                            Visual guide only. The groomer confirms the safest achievable result.
                        </p>

                        <button
                            type='button'
                            onClick={() => {
                                setShowCompareModal(false)
                                const card = document.getElementById('ai-preview-comparison-card')
                                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }}
                            className='w-full rounded-xl bg-[#2B4C3F] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#1f372d]'
                        >
                            Close &amp; Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
