/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { IGatsbyImageData, GatsbyImage } from "gatsby-plugin-image"
import Layout from "@lekoarts/gatsby-theme-jodie/src/components/layout"
// 1. Import it with a temporary name
import OriginalGridItem from "@lekoarts/gatsby-theme-jodie/src/components/grid-item"

// 2. Cast it as 'any' to bypass the strict TypeScript return check
const GridItem = OriginalGridItem as any;import { itemListWrapperStyles, itemStyles } from "@lekoarts/gatsby-theme-jodie/src/styles/item-list"
import locales from "@lekoarts/gatsby-theme-jodie/src/locales"
import { visuallyHidden } from "@lekoarts/gatsby-theme-jodie/src/styles/utils"
import modifyGrid from "@lekoarts/gatsby-theme-jodie/src/utils/modify-grid"
import Seo from "@lekoarts/gatsby-theme-jodie/src/components/seo"

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
  const rawItems = [...pages.nodes, ...projects.nodes]
  const items = modifyGrid(rawItems)
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
    <h1 sx={{ position: `absolute`, width: 1, height: 1, overflow: `hidden`, clip: `rect(0 0 0 0)` }}>
      Home
    </h1>
    
    {/* --- YOUR NEW TEXT SECTION --- */}
    <div 
      style={{ 
        padding: "4rem 2rem", 
        textAlign: "center", 
        maxWidth: "800px", 
        margin: "0 auto",
        color: "var(--theme-ui-colors-text)" // Uses the theme's text color natively
      }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Welcome.</h2>
      <p style={{ lineHeight: 1.6, fontSize: "1.1rem" }}>
        This is a small custom text section. It sits perfectly above the grid
        and adapts to the site's dark/light modes cleanly.
      </p>
    </div>
    {/* ----------------------------- */}

    {/* The original grid stays below untouched */}
      <div sx={itemListWrapperStyles}>
        {items.map((item) => (
          <GridItem key={item.title} item={item} />
        ))}
      </div>
  </Layout>
)}
export default Homepage

export const Head: HeadFC = () => <Seo />
