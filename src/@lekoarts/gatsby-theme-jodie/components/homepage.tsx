/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { IGatsbyImageData, GatsbyImage } from "gatsby-plugin-image"

// Absolute theme imports
import Layout from "@lekoarts/gatsby-theme-jodie/src/components/layout"
import GridItem from "@lekoarts/gatsby-theme-jodie/src/components/grid-item"
import { itemListWrapperStyles, itemStyles } from "@lekoarts/gatsby-theme-jodie/src/styles/item-list"
import locales from "@lekoarts/gatsby-theme-jodie/src/locales"
import { visuallyHidden } from "@lekoarts/gatsby-theme-jodie/src/styles/utils"
import Seo from "@lekoarts/gatsby-theme-jodie/src/components/seo"

// 🛡️ BULLETPROOF TS FIX
const SafeGridItem = GridItem as any;
const SafeGatsbyImage = GatsbyImage as any;

export type JodieHomepageProps = {
  pages: {
    nodes: {
      slug: string
      title: string
      cover: {
        childImageSharp: {
          gatsbyImageData: IGatsbyImageData
        }
      }
      __typename: "MdxPage"
    }[]
  }
}

const Homepage: React.FC<PageProps<JodieHomepageProps>> = ({ data: { pages } }) => {
  
  // 1. Locate the specific pages by checking their titles
  const aboutPage = pages.nodes.find(p => p.title.toLowerCase().includes("about"))
  const audioPage = pages.nodes.find(p => p.title.toLowerCase().includes("audio"))
  const contactPage = pages.nodes.find(p => p.title.toLowerCase().includes("contact"))

  // 2. Build the array in the EXACT order you want them to appear on screen
  const orderedItems = [
    aboutPage,
    { isCustom: true, title: "Game Projects", slug: "/projects", imgPath: "/projects-cover.png" },
    audioPage,
    contactPage
  ].filter(Boolean) // This safely ignores any page that might be missing or renamed

  const itemsCount = orderedItems.length
  let divisor = 9

  for (let i = 0; i < itemsCount; i++) {
    const quotient = itemsCount % divisor
    const quotientAlt = (itemsCount - 1) % divisor

    if (quotient === 0 || quotientAlt === 0) {
      break
    }
    divisor -= 1
  }

  return (
    <Layout>
      <h1 sx={visuallyHidden} data-testid="page-title">
        {locales.home}
      </h1>

      {/* --- CUSTOM TEXT SECTION USING NATIVE STYLES --- */}
    <div 
        style={{ 
        padding: "4rem 2rem", 
        maxWidth: "800px", 
        margin: "0 auto", 
        textAlign: "center" 
        }}
    >
        <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Hi There! 👋
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--theme-ui-colors-secondary, #888)" }}>
            I'm Robert. I'm a game developer and audio engineer with a passion for creating immersive experiences.
            This portfolio showcases my work in both fields, from game projects to live worship audio engineering.
        </p>
    </div>
      {/* ----------------------------------------------- */}

      <div className={`item-list-wrapper`} sx={itemListWrapperStyles}>
        <div className={`item-list div${divisor}`}>
          {orderedItems.length > 0 ? (
            orderedItems.map((item: any, index) => {
              
              // If it's our manually injected Game Projects card
              if (item.isCustom) {
                return (
                  <SafeGridItem to={item.slug} className="item" key={item.title} sx={itemStyles} data-testid={item.title}>
                    <img 
                      src={item.imgPath} 
                      alt={item.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <span>{item.title}</span>
                  </SafeGridItem>
                )
              }

              // Otherwise, render it as a standard MDX page
              return (
                <SafeGridItem to={item.slug} className="item" key={item.title} sx={itemStyles} data-testid={item.title}>
                  <SafeGatsbyImage
                    loading={index === 0 ? `eager` : `lazy`}
                    image={item.cover.childImageSharp.gatsbyImageData}
                    alt=""
                  />
                  <span>{item.title}</span>
                </SafeGridItem>
              )
            })
          ) : (
            <div style={{ padding: "1rem" }}>
              No pages found!
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Homepage

export const Head: HeadFC = () => <Seo />