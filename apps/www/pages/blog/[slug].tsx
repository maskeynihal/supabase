import { NextSeo } from 'next-seo'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import matter from 'gray-matter'
import authors from 'lib/authors.json'
import { MDXRemote } from 'next-mdx-remote'
import { Badge, Divider, IconChevronLeft } from 'ui'

import CTABanner from '~/components/CTABanner'
import DefaultLayout from '~/components/Layouts/Default'
import BlogLinks from '~/components/LaunchWeek/7/BlogLinks'
import { generateReadingTime } from '~/lib/helpers'
import ShareArticleActions from '~/components/Blog/ShareArticleActions'
// import useActiveAnchors from '~/hooks/useActiveAnchors'
import mdxComponents from '~/lib/mdx/mdxComponents'
import { mdxSerialize } from '~/lib/mdx/mdxSerialize'
import { getAllPostSlugs, getPostdata, getSortedPosts } from '~/lib/posts'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

// table of contents extractor
const toc = require('markdown-toc')

export async function getStaticPaths() {
  const paths = getAllPostSlugs('_blog')
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }: any) {
  const filePath = `${params.slug}`
  const postContent = await getPostdata(filePath, '_blog')
  const { data, content } = matter(postContent)

  const mdxSource: any = await mdxSerialize(content)

  const relatedPosts = getSortedPosts('_blog', 5, mdxSource.scope.tags)

  const allPosts = getSortedPosts('_blog')

  const currentIndex = allPosts
    .map(function (e) {
      return e.slug
    })
    .indexOf(filePath)

  const nextPost = allPosts[currentIndex + 1]
  const prevPost = allPosts[currentIndex - 1]

  return {
    props: {
      prevPost: currentIndex === 0 ? null : prevPost ? prevPost : null,
      nextPost: currentIndex === allPosts.length ? null : nextPost ? nextPost : null,
      relatedPosts,
      blog: {
        slug: `${params.slug}`,
        content: mdxSource,
        source: content,
        ...data,
        toc: toc(content, { maxdepth: data.toc_depth ? data.toc_depth : 2 }),
      },
    },
  }
}

function BlogPostPage(props: any) {
  const content = props.blog.content
  const authorArray = props.blog.author.split(',')
  // useActiveAnchors('h2, h3, h4')
  const isLaunchWeek7 = props.blog.launchweek === 7

  const author = []
  for (let i = 0; i < authorArray.length; i++) {
    author.push(
      // @ts-ignore
      authors.find((authors: string) => {
        // @ts-ignore
        return authors.author_id === authorArray[i]
      })
    )
  }

  const { basePath } = useRouter()

  const NextCard = (props: any) => {
    const { post, label, className } = props

    return (
      <Link href={`${post.path}`} as={`${post.path}`}>
        <div className={className}>
          <div className="border-scale-500 hover:bg-scale-100 dark:hover:bg-scale-300 cursor-pointer rounded border p-6 transition">
            <div className="space-y-4">
              <div>
                <p className="text-scale-900 text-sm">{label}</p>
              </div>
              <div>
                <h4 className="text-scale-1200 text-lg">{post.title}</h4>
                <p className="small">{post.date}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const toc = props.blog.toc && (
    <div className="space-y-8 py-8 lg:py-0">
      <div>
        <div className="flex flex-wrap gap-2">
          {props.blog.tags.map((tag: string) => {
            return (
              <a href={`/blog/tags/${tag}`} key={`category-badge-${tag}`}>
                <Badge>{tag}</Badge>
              </a>
            )
          })}
        </div>
      </div>
      <div>
        <div>
          <p className="text-scale-1200 mb-4">On this page</p>
          <div className="prose-toc">
            <ReactMarkdown>{props.blog.toc.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <NextSeo
        title={props.blog.title}
        description={props.blog.description}
        openGraph={{
          title: props.blog.title,
          description: props.blog.description,
          url: `https://supabase.com/blog/${props.blog.slug}`,
          type: 'article',
          videos: props.blog.video && [
            {
              // youtube based video meta
              url: props.blog.video,
              type: 'application/x-shockwave-flash',
              width: 640,
              height: 385,
            },
          ],
          article: {
            //
            // to do: add expiration and modified dates
            // https://github.com/garmeeh/next-seo#article
            publishedTime: props.blog.date,
            //
            // to do: author urls should be internal in future
            // currently we have external links to github profiles
            authors: [props.blog.author_url],
            tags: props.blog.tags.map((cat: string) => {
              return cat
            }),
          },
          images: [
            {
              url: `https://supabase.com${basePath}/images/blog/${
                props.blog.image ? props.blog.image : props.blog.thumb
              }`,
              alt: `${props.blog.title} thumbnail`,
            },
          ],
        }}
      />
      <DefaultLayout>
        <div
          className="
            container mx-auto px-8 py-16 sm:px-16
            xl:px-20
          "
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 mb-2 lg:col-span-2">
              {/* Back button */}
              <p>
                <a
                  href={'/blog'}
                  className="text-scale-900 hover:text-scale-1200 flex cursor-pointer items-center text-sm transition"
                >
                  <IconChevronLeft style={{ padding: 0 }} />
                  Back
                </a>
              </p>
            </div>
            <div className="col-span-12 lg:col-span-12 xl:col-span-10">
              {/* Title and description */}
              <div className="mb-16 max-w-5xl space-y-8">
                <div className="space-y-4">
                  <p className="text-brand-900">Blog post</p>
                  <h1 className="h1">{props.blog.title}</h1>
                  <div className="text-scale-900 flex space-x-3 text-sm">
                    <p>{props.blog.date}</p>
                    <p>•</p>
                    <p>{generateReadingTime(props.blog.source)}</p>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex-1 flex flex-col gap-3 pt-6 md:flex-row md:gap-0 lg:gap-3">
                      {author.map((author: any, i: number) => {
                        return (
                          <div className="mr-4 w-max" key={i}>
                            <Link href={author.author_url} target="_blank">
                              <a className="cursor-pointer">
                                <div className="flex items-center gap-3">
                                  {author.author_image_url && (
                                    <div className="w-10">
                                      <Image
                                        src={author.author_image_url}
                                        className="dark:border-dark rounded-full border"
                                        alt={`${author.author} avatar`}
                                        width="100%"
                                        height="100%"
                                        layout="responsive"
                                      />
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-scale-1200 mb-0 text-sm">
                                      {author.author}
                                    </span>
                                    <span className="text-scale-900 mb-0 text-xs">
                                      {author.position}
                                    </span>
                                  </div>
                                </div>
                              </a>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 lg:gap-16 xl:gap-8">
                {/* Content */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-7">
                  <article>
                    <div className={['prose prose-docs'].join(' ')}>
                      {props.blog.youtubeHero ? (
                        <iframe
                          className="w-full"
                          width="700"
                          height="350"
                          src={props.blog.youtubeHero}
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          // @ts-expect-error
                          allowfullscreen={true}
                        ></iframe>
                      ) : (
                        props.blog.thumb && (
                          <div className="relative mb-8 h-96 w-full overflow-auto rounded-lg border">
                            <Image
                              src={'/images/blog/' + props.blog.thumb}
                              alt={props.blog.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        )
                      )}
                      <MDXRemote {...content} components={mdxComponents()} />
                    </div>
                  </article>
                  {isLaunchWeek7 && <BlogLinks />}
                  <div className="block lg:hidden py-8">
                    <div className="text-scale-900 dark:text-scale-1000 text-sm">
                      Share this article
                    </div>
                    <ShareArticleActions title={props.blog.title} slug={props.blog.slug} />
                  </div>
                  <div className="grid gap-8 py-8 lg:grid-cols-1">
                    <div>
                      {props.prevPost && <NextCard post={props.prevPost} label="Last post" />}
                    </div>
                    <div>
                      {props.nextPost && (
                        <NextCard post={props.nextPost} label="Next post" className="text-right" />
                      )}
                    </div>
                  </div>
                </div>
                {/* Sidebar */}
                <div className="col-span-12 space-y-8 lg:col-span-5 xl:col-span-3 xl:col-start-9">
                  <div className="space-y-6 lg:sticky lg:top-24 lg:mb-48">
                    <div className="hidden lg:block">{toc}</div>
                    <div>
                      <div className="mb-4">
                        <p className="text-scale-1200 text-sm">Related articles</p>
                      </div>
                      <div className="space-y-2">
                        {props.relatedPosts.map((post: any, i: number) => (
                          <Link href={`${post.path}`} as={`${post.path}`} key={i}>
                            <div>
                              <p className="cursor-pointer">
                                <div className="flex gap-2">
                                  {/* <div className="text-scale-900">
                                    <IconFile size={'small'} style={{ minWidth: '1.2rem' }} />
                                  </div> */}
                                  <span className="text-scale-1100 hover:text-gray-1200 text-sm">
                                    {post.title}
                                  </span>
                                </div>
                              </p>
                              <Divider light className="mt-2" />
                            </div>
                          </Link>
                        ))}
                        <div className="mt-2">
                          <Link href={`/blog`} passHref>
                            <a className="text-scale-1100 hover:text-scale-1200 cursor-pointer text-xs">
                              View all posts
                            </a>
                          </Link>
                        </div>
                        <div className="py-4 hidden lg:block">
                          <div className="text-scale-1200 text-sm">Share this article</div>
                          <ShareArticleActions title={props.blog.title} slug={props.blog.slug} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CTABanner />
      </DefaultLayout>
    </>
  )
}

export default BlogPostPage
