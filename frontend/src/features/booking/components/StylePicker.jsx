import { Fragment } from 'react'
import {
    Check,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles
} from 'lucide-react'

const formatImageSrc = (src) => {
    if (!src) return ''
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
        return src
    }
    return `data:image/png;base64,${src}`
}

export default function StylePicker({
    styles,
    recommendations,
    stylePreviews,
    selectedStyleId,
    onSelect,
    onRetry,
    petType,
    photoReady,
    loading,
    generationBusy
}) {
    const normalizedPetType =
        String(petType || 'dog').toLowerCase()
    const recommendationsById = new Map(
        recommendations.map((item) => [item.id, item])
    )
    const stylesById = new Map(
        styles.map((style) => [style.id, style])
    )
    const recommendedStyles = recommendations
        .map((item) => stylesById.get(item.id))
        .filter(Boolean)
    const recommendedIds = new Set(
        recommendedStyles.map((style) => style.id)
    )
    const moreStyles = styles
        .filter((style) => !recommendedIds.has(style.id))
        .sort((first, second) =>
            first.name.localeCompare(second.name)
        )

    const renderStyleGroup = ({
        title,
        description,
        groupStyles,
        recommended = false
    }) => {
        if (!groupStyles.length) return null

        return (
            <section>
                <div className='mb-3 flex items-start gap-3'>
                    {recommended && (
                        <span className='mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e5f1ea] text-[#24523f]'>
                            <Sparkles size={17} />
                        </span>
                    )}
                    <div>
                        <h4 className='font-serif text-lg font-bold'>{title}</h4>
                        <p className='mt-0.5 text-xs leading-5 text-[#806654]'>{description}</p>
                    </div>
                </div>

                <div className='grid items-stretch gap-3 sm:grid-cols-2'>
                    {groupStyles.map((style) => {
                        const selected =
                            selectedStyleId === style.id
                        const recommendation =
                            recommendationsById.get(style.id)
                        const preview =
                            stylePreviews[style.id] || {
                                status: 'idle'
                            }
                        const ready =
                            preview.status === 'ready' &&
                            preview.generatedImage
                        const failed =
                            preview.status === 'error'
                        const canGenerate =
                            photoReady &&
                            preview.status === 'idle' &&
                            !generationBusy

                        return (
                            <Fragment key={style.id}>
                                <button
                                    type='button'
                                    onClick={() => ready
                                        ? onSelect(style.id)
                                        : onRetry(style.id)}
                                    disabled={
                                        (!ready && !failed && !canGenerate) ||
                                        ((failed || canGenerate) && generationBusy)
                                    }
                                    aria-pressed={selected}
                                    aria-label={failed
                                        ? `Retry ${style.name} preview`
                                        : ready
                                            ? `Select ${style.name}`
                                            : canGenerate
                                                ? `Generate ${style.name} preview`
                                                : `${style.name} preview is not ready`}
                                    className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white p-0 text-left align-top transition-all duration-300 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84522] focus-visible:ring-offset-2 disabled:cursor-wait ${selected ? 'border-[#a84522] bg-[#fffaf6] ring-2 ring-[#a84522]/30 shadow-md -translate-y-1' : 'border-[#e5d6c5] enabled:hover:-translate-y-1 enabled:hover:border-[#c88968] enabled:hover:shadow-md'}`}
                                >
                                    <span className='relative block w-full shrink-0 overflow-hidden'>
                                        {ready ? (
                                            <img
                                                src={formatImageSrc(preview.generatedImage)}
                                                alt={`${style.name} generated on the uploaded pet`}
                                                className='h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105'
                                            />
                                        ) : (
                                            <span className='grid h-36 w-full place-items-center bg-[#f7f2eb] px-5 text-center text-[#806654]'>
                                                {preview.status === 'generating' ? (
                                                    <span role='status'>
                                                        <Loader2 size={26} className='mx-auto mb-2 animate-spin text-[#24523f]' />
                                                        <span className='text-xs font-semibold'>Creating this style on your pet…</span>
                                                    </span>
                                                ) : failed ? (
                                                    <span>
                                                        <RefreshCw size={24} className='mx-auto mb-2 text-[#a94723]' />
                                                        <span className='text-xs font-semibold'>
                                                            {generationBusy
                                                                ? 'Another preview is being created. Please wait.'
                                                                : preview.error || 'Couldn’t create this style. Select to retry.'}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <ImageIcon size={26} className='mx-auto mb-2 text-[#a94723]' />
                                                        <span className='text-xs font-semibold'>
                                                            {!photoReady
                                                                ? 'Upload your pet’s photo first'
                                                                : generationBusy
                                                                    ? 'Available after the current preview'
                                                                    : 'Generate preview'}
                                                        </span>
                                                    </span>
                                                )}
                                            </span>
                                        )}

                                        {recommendation && (
                                            <span className='absolute left-3 top-3 rounded-full bg-[#234638] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white'>
                                                {recommendation.rank === 1
                                                    ? 'Top suggestion'
                                                    : 'Suggested'}
                                            </span>
                                        )}

                                        {ready && (
                                            <span className='absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-[#6f5544] shadow-sm'>Your pet</span>
                                        )}
                                    </span>

                                    <span className='block w-full flex-1 p-4'>
                                        <span className='flex items-start justify-between gap-3'>
                                            <span className='font-serif text-lg font-bold'>{style.name}</span>
                                            {selected && (
                                                <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff0e7] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#9c4424]'>
                                                    <Check size={11} />Selected
                                                </span>
                                            )}
                                        </span>
                                        <span className='mt-1 block text-xs leading-5 text-[#806654]'>{style.description}</span>
                                        {recommendation?.reason && (
                                            <span className='mt-2 block border-t border-[#efe4d7] pt-2 text-[11px] leading-5 text-[#24523f]'>{recommendation.reason}</span>
                                        )}
                                        {style.coatSafety && (
                                            <span className='mt-2 block text-[11px] leading-5 text-[#8b5a2b]'>{style.coatSafety}</span>
                                        )}
                                    </span>
                                </button>

                                {selected && ready && (
                                    <div className='col-span-full overflow-hidden rounded-2xl border border-[#cfbca9] bg-white xl:hidden'>
                                        <div className='flex items-center justify-between gap-3 border-b border-[#eadfce] px-4 py-3'>
                                            <div>
                                                <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[#a94723]'>Selected preview</p>
                                                <p className='font-serif text-lg font-bold'>{style.name}</p>
                                            </div>
                                            <span className='grid h-8 w-8 place-items-center rounded-full bg-[#e7f2eb] text-[#24523f]'>
                                                <Check size={16} />
                                            </span>
                                        </div>
                                        <img
                                            src={formatImageSrc(preview.generatedImage)}
                                            alt={`Selected ${style.name} preview on the uploaded pet`}
                                            className='max-h-[28rem] w-full object-contain'
                                        />
                                    </div>
                                )}
                            </Fragment>
                        )
                    })}
                </div>
            </section>
        )
    }

    return (
        <div className='space-y-7'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
                <div>
                    <h3 className='font-serif text-xl font-bold'>Choose your pet’s style</h3>
                    <p className='mt-1 text-sm text-[#806654]'>The top recommendation is created first. Generate any other style when you want to compare it.</p>
                </div>
                {loading && (
                    <span className='text-xs font-semibold text-[#806654]' role='status'>Preparing style choices…</span>
                )}
            </div>

            {styles.length ? (
                <>
                    {renderStyleGroup({
                        title: 'Recommended for this season',
                        description: 'The top suggestion is generated automatically. Select another card to generate it on demand.',
                        groupStyles: recommendedStyles,
                        recommended: true
                    })}
                    {renderStyleGroup({
                        title: `More styles for your ${normalizedPetType}`,
                        description: 'Select any compatible style to generate its personalized preview on demand.',
                        groupStyles: moreStyles
                    })}
                </>
            ) : (
                <div className='rounded-2xl border border-[#e5d6c5] bg-white p-6 text-sm text-[#806654]'>No compatible styles are available for this pet.</div>
            )}
        </div>
    )
}
