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

// 🛡️ BULLETPROOF TS FIX: Force TypeScript to accept these components
const SafeGridItem = GridItem as any;
const SafeGatsbyImage = GatsbyImage as any;

export type JodieHomepageProps = {
  projects: {
    nodes: {
      slug: string
      title: string
      cover: {
        childImageSharp: {
          gatsbyImageData: IGatsbyImageData
        }
      }
      __typename: "MdxProject"
    }[]
  }
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

const Homepage: React.FC<PageProps<JodieHomepageProps>> = ({ data: { pages, projects } }) => {
  
  // 💥 ONLY PULL PAGES: Game projects are mathematically excluded from the array
  const items = [...pages.nodes] 
  
  const itemsCount = items.length
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
          Welcome to my portfolio
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--theme-ui-colors-secondary, #888)" }}>
          I am a game developer and student. This section now sits comfortably above my grid, 
          which currently only displays my primary pages.
        </p>
      </div>
      {/* ----------------------------------------------- */}

      <div className={`item-list-wrapper`} sx={itemListWrapperStyles}>
        <div className={`item-list div${divisor}`}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <SafeGridItem to={item.slug} className="item" key={item.title} sx={itemStyles} data-testid={item.title}>
                <SafeGatsbyImage
                  loading={index === 0 ? `eager` : `lazy`}
                  image={item.cover.childImageSharp.gatsbyImageData}
                  alt=""
                />
                <span>{item.title}</span>
              </SafeGridItem>
            ))
          ) : (
            <div style={{ padding: "1rem" }}>
              No pages found at the locations defined for "pagesPath"
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Homepage

export const Head: HeadFC = () => <Seo />