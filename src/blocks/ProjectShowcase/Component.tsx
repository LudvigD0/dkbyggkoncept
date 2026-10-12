import type { ProjectShowcaseBlock } from '@/payload-types'
import { ProjectSlider } from './Gallery.client'
import { Actions, Photo, SectionHeading } from '../siteComponents'
import { PhotoPlaceholder } from './Placeholder'

export function ProjectShowcaseComponent(block: ProjectShowcaseBlock) {
  const projects = (block.projects || []).filter((project) => project.images?.length)
  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <SectionHeading {...block} />
        </div>
        <Actions links={block.links} />
      </div>
      {projects.length ? (
        <div className="mt-10 space-y-12">
          {projects.map((project, index) => (
            <article key={project.id || index} className="border-t border-border pt-7">
              <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold md:text-3xl">{project.title}</h3>
                  {project.description && (
                    <p className="mt-3 whitespace-pre-line text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.imageNotice && (
                    <p className="mt-3 text-sm text-muted-foreground">{project.imageNotice}</p>
                  )}
                </div>
                {(project.category || project.place) && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {[project.category, project.place].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <ProjectSlider
                count={project.images!.length}
                label={project.title}
                previousLabel={block.previousLabel || 'Föregående bild'}
                nextLabel={block.nextLabel || 'Nästa bild'}
                scrollLabel={block.scrollLabel}
              >
                {project.images!.map((photo, photoIndex) => (
                  <figure
                    key={photo.id || photoIndex}
                    className="min-w-0 basis-[88%] shrink-0 snap-start sm:basis-[70%] lg:basis-[calc((100%_-_1.25rem)/2)]"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      {photo.image && typeof photo.image === 'object' ? (
                        <Photo
                          {...photo}
                          className="aspect-[4/3] rounded-none"
                          sizes="(max-width: 639px) 88vw, (max-width: 1023px) 70vw, 630px"
                        />
                      ) : (
                        <PhotoPlaceholder label={block.placeholderLabel} className="aspect-[4/3]" />
                      )}
                      <span className="absolute top-4 left-4 border-l-2 border-accent bg-ink px-4 py-2 text-sm font-semibold text-white">
                        {photo.stage === 'before'
                          ? block.beforeLabel || 'Före'
                          : block.afterLabel || 'Efter'}
                      </span>
                    </div>
                    <figcaption className="flex items-baseline justify-between gap-4 border-b border-border py-4">
                      <p className="text-sm text-muted-foreground">{photo.caption}</p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {photoIndex + 1} / {project.images!.length}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </ProjectSlider>
              <Actions links={project.links} />
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 border-t border-border pt-8">
          <p className="whitespace-pre-line text-lg text-muted-foreground">{block.emptyText}</p>
          <Photo
            image={block.emptyImage}
            imageLabel={block.emptyImageLabel}
            className="mt-6 aspect-[4/3] max-w-xl"
          />
        </div>
      )}
    </section>
  )
}
