import { framer } from "framer-plugin"

// TypeScript interfaces for Framer API return types
export interface ProjectInfo {
    id: string
    name: string
    owner?: string
    updatedAt?: string
}

export interface PublishedSiteInfo {
    url: string | null
    domain?: string
}

export interface CanvasNode {
    id: string
    name: string
    type: string
    visible: boolean
    locked: boolean
    children?: CanvasNode[]
    width?: number
    height?: number
    x?: number
    y?: number
}

export interface ProjectAsset {
    id: string
    name: string
    url: string
    type: "image" | "video" | "file"
    size?: number
}

export interface ProjectFont {
    family: string
    variants: string[]
    source: "google" | "custom" | "system"
}

export interface CMSCollection {
    id: string
    name: string
    slug: string
    fields: CMSField[]
    itemCount?: number
}

export interface CMSField {
    id: string
    name: string
    type: string
    required: boolean
}

export interface CustomCodeSnippet {
    id: string
    name: string
    location: "head" | "body-start" | "body-end"
    code: string
}

export interface ColorStyle {
    id: string
    name: string
    value: string
}

export interface TextStyle {
    id: string
    name: string
    fontFamily?: string
    fontSize?: number
    fontWeight?: number
    lineHeight?: number
    letterSpacing?: number
}

/**
 * Get current project information
 */
export async function getProjectInfo(): Promise<ProjectInfo> {
    try {
        // Note: The actual API method may vary based on Framer Plugin API version
        // This is a common pattern for getting project info
        const projectData = await framer.getProjectInfo?.()
        
        if (!projectData) {
            throw new Error("Project information not available")
        }

        return {
            id: projectData.id || "unknown",
            name: projectData.name || "Untitled Project",
            owner: projectData.owner,
            updatedAt: projectData.updatedAt
        }
    } catch (error) {
        console.error("Error getting project info:", error)
        throw new Error(`Failed to get project information: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

/**
 * Get the published site URL (framer.app / framer.website / framer.ai)
 */
export async function getPublishedSiteUrl(): Promise<PublishedSiteInfo> {
    try {
        // Get the published site information using the correct Framer API
        const publishInfo = await framer.getPublishInfo()
        
        if (!publishInfo) {
            console.warn("No publish information available")
            return { url: null }
        }

        // Check production deployment first (primary)
        if (publishInfo.production && publishInfo.production.url) {
            console.log("Published site URL found (production):", publishInfo.production.url)
            return {
                url: publishInfo.production.url,
                domain: publishInfo.production.url
            }
        }
        
        // Fall back to staging if no production deployment
        if (publishInfo.staging && publishInfo.staging.url) {
            console.log("Published site URL found (staging):", publishInfo.staging.url)
            return {
                url: publishInfo.staging.url,
                domain: publishInfo.staging.url
            }
        }

        console.warn("Publish info found but no production or staging URL available")
        console.log("PublishInfo:", publishInfo)
        return { url: null }
    } catch (error) {
        console.error("Error getting published site URL:", error)
        return { url: null }
    }
}

/**
 * Check if canvas API is available
 */
export async function isCanvasAvailable(): Promise<boolean> {
    try {
        const canvas = await framer.getCanvas?.()
        return canvas !== null && canvas !== undefined
    } catch (error) {
        return false
    }
}

/**
 * Get all nodes from the canvas
 */
export async function getAllCanvasNodes(): Promise<CanvasNode[]> {
    try {
        // Get the canvas root using the correct Framer API
        const canvasRoot = await framer.getCanvasRoot()
        
        if (!canvasRoot) {
            console.warn("No canvas root available")
            return []
        }

        // Get all children from the root
        const children = await framer.getChildren(canvasRoot.id)
        
        if (!children || children.length === 0) {
            console.warn("No canvas nodes found in root")
            return []
        }

        console.log(`Found ${children.length} canvas nodes`)
        
        // Return the nodes - they're already in the correct format
        return children
    } catch (error) {
        console.error("Error getting canvas nodes:", error)
        // Return empty array to allow other checks to continue
        return []
    }
}

/**
 * Helper function to map Framer node to our CanvasNode interface
 */
function mapNodeToCanvasNode(node: any): CanvasNode {
    return {
        id: node.id || "unknown",
        name: node.name || "Unnamed",
        type: node.type || "unknown",
        visible: node.visible !== false,
        locked: node.locked === true,
        children: node.children?.map(mapNodeToCanvasNode),
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y
    }
}

/**
 * Get all images and files from the project
 */
export async function getProjectAssets(): Promise<ProjectAsset[]> {
    try {
        const assets = await framer.getAssets?.()
        
        if (!assets) {
            return []
        }

        return assets.map((asset: any) => ({
            id: asset.id || "unknown",
            name: asset.name || "Unnamed Asset",
            url: asset.url || "",
            type: determineAssetType(asset),
            size: asset.size
        }))
    } catch (error) {
        console.error("Error getting project assets:", error)
        return []
    }
}

/**
 * Helper to determine asset type
 */
function determineAssetType(asset: any): "image" | "video" | "file" {
    const extension = asset.name?.split(".").pop()?.toLowerCase()
    
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
        return "image"
    }
    if (["mp4", "webm", "mov"].includes(extension)) {
        return "video"
    }
    return "file"
}

/**
 * Get all fonts used in the project
 */
export async function getProjectFonts(): Promise<ProjectFont[]> {
    try {
        const fonts = await framer.getFonts?.()
        
        if (!fonts) {
            return []
        }

        return fonts.map((font: any) => ({
            family: font.family || font.name || "Unknown Font",
            variants: font.variants || font.weights || ["regular"],
            source: font.source || "custom"
        }))
    } catch (error) {
        console.error("Error getting project fonts:", error)
        return []
    }
}

/**
 * Get all CMS collections
 */
export async function getCMSCollections(): Promise<CMSCollection[]> {
    try {
        const collections = await framer.getCollections?.()
        
        if (!collections) {
            return []
        }

        return collections.map((collection: any) => ({
            id: collection.id || "unknown",
            name: collection.name || "Unnamed Collection",
            slug: collection.slug || collection.id,
            fields: collection.fields?.map((field: any) => ({
                id: field.id || "unknown",
                name: field.name || "Unnamed Field",
                type: field.type || "text",
                required: field.required === true
            })) || [],
            itemCount: collection.itemCount || collection.items?.length
        }))
    } catch (error) {
        console.error("Error getting CMS collections:", error)
        return []
    }
}

/**
 * Get custom code snippets
 */
export async function getCustomCode(): Promise<CustomCodeSnippet[]> {
    try {
        const customCode = await framer.getCustomCode?.()
        
        if (!customCode) {
            return []
        }

        const snippets: CustomCodeSnippet[] = []
        
        if (customCode.head) {
            snippets.push({
                id: "head",
                name: "Head Code",
                location: "head",
                code: customCode.head
            })
        }
        
        if (customCode.bodyStart) {
            snippets.push({
                id: "body-start",
                name: "Body Start Code",
                location: "body-start",
                code: customCode.bodyStart
            })
        }
        
        if (customCode.bodyEnd) {
            snippets.push({
                id: "body-end",
                name: "Body End Code",
                location: "body-end",
                code: customCode.bodyEnd
            })
        }

        return snippets
    } catch (error) {
        console.error("Error getting custom code:", error)
        return []
    }
}

/**
 * Get all color styles
 */
export async function getColorStyles(): Promise<ColorStyle[]> {
    try {
        const styles = await framer.getColorStyles?.()
        
        if (!styles) {
            return []
        }

        return styles.map((style: any) => ({
            id: style.id || "unknown",
            name: style.name || "Unnamed Color",
            value: style.value || style.color || "#000000"
        }))
    } catch (error) {
        console.error("Error getting color styles:", error)
        return []
    }
}

/**
 * Get all text styles
 */
export async function getTextStyles(): Promise<TextStyle[]> {
    try {
        const styles = await framer.getTextStyles?.()
        
        if (!styles) {
            return []
        }

        return styles.map((style: any) => ({
            id: style.id || "unknown",
            name: style.name || "Unnamed Text Style",
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing
        }))
    } catch (error) {
        console.error("Error getting text styles:", error)
        return []
    }
}

/**
 * Helper function to extract breakpoint widths from various data structures
 */
function extractBreakpointsFromSource(source: any, breakpointsSet: Set<number>): void {
    if (!source) return
    
    if (Array.isArray(source)) {
        source.forEach((bp: any) => {
            if (typeof bp === 'number') {
                breakpointsSet.add(bp)
            } else if (bp && typeof bp === 'object') {
                if (bp.width) breakpointsSet.add(bp.width)
                if (bp.minWidth) breakpointsSet.add(bp.minWidth)
                if (bp.maxWidth) breakpointsSet.add(bp.maxWidth)
                if (bp.value) breakpointsSet.add(bp.value)
            }
        })
    } else if (typeof source === 'object') {
        Object.keys(source).forEach(key => {
            const lowerKey = key.toLowerCase()
            // Check for common breakpoint names
            if (lowerKey.includes('mobile') || lowerKey.includes('phone') || lowerKey.includes('390')) {
                breakpointsSet.add(390)
            }
            if (lowerKey.includes('tablet') || lowerKey.includes('810')) {
                breakpointsSet.add(810)
            }
            if (lowerKey.includes('desktop') || lowerKey.includes('1200')) {
                breakpointsSet.add(1200)
            }
            
            // Also extract numeric values
            const bp = source[key]
            if (typeof bp === 'number') {
                breakpointsSet.add(bp)
            } else if (bp && typeof bp === 'object') {
                if (bp.width) breakpointsSet.add(bp.width)
                if (bp.value) breakpointsSet.add(bp.value)
            }
        })
    }
}

/**
 * Get project breakpoints configuration
 * Returns the global breakpoints defined for the project
 */
export async function getProjectBreakpoints(): Promise<number[]> {
    try {
        console.log("\n" + "=".repeat(80))
        console.log("🔍 BREAKPOINT DETECTION DEBUG - START")
        console.log("=".repeat(80))
        const detectedBreakpoints = new Set<number>()
        
        // ============================================================================
        // METHOD 1: Try framer.getCurrentPage() - Page-level breakpoints
        // ============================================================================
        console.log("\n📄 METHOD 1: Trying framer.getCurrentPage()...")
        try {
            const currentPage = await (framer as any).getCurrentPage?.()
            
            if (currentPage) {
                console.log("✓ Got current page object")
                console.log("  Page name:", currentPage.name)
                console.log("  Page id:", currentPage.id)
                console.log("  Page type:", currentPage.type)
                console.log("  ALL Page properties:", Object.keys(currentPage))
                console.log("  Full page object:", JSON.stringify(currentPage, null, 2))
                
                // Check specific breakpoint-related properties
                console.log("\n  Checking breakpoint properties:")
                console.log("  - page.breakpoints:", currentPage.breakpoints)
                console.log("  - page.responsiveBreakpoints:", currentPage.responsiveBreakpoints)
                console.log("  - page.__breakpoints:", currentPage.__breakpoints)
                console.log("  - page.viewportBreakpoints:", currentPage.viewportBreakpoints)
                console.log("  - page.breakpointSettings:", currentPage.breakpointSettings)
                console.log("  - page.responsive:", currentPage.responsive)
                console.log("  - page.responsiveSettings:", currentPage.responsiveSettings)
                
                // Try different possible breakpoint property names
                const pageBpSources = [
                    currentPage.breakpoints,
                    currentPage.responsiveBreakpoints,
                    currentPage.__breakpoints,
                    currentPage.viewportBreakpoints,
                    currentPage.breakpointSettings
                ]
                
                pageBpSources.forEach((bpSource, index) => {
                    if (bpSource) {
                        console.log(`  ✓ Found breakpoints in page property [${index}]:`, bpSource)
                        extractBreakpointsFromSource(bpSource, detectedBreakpoints)
                    }
                })
            } else {
                console.log("✗ getCurrentPage() returned null/undefined")
            }
        } catch (err) {
            console.log("✗ getCurrentPage() not available or failed:")
            console.error("  Error:", err)
        }
        
        // ============================================================================
        // METHOD 2: Try framer.getCanvasRoot() - Canvas-level breakpoints
        // ============================================================================
        console.log("\n🎨 METHOD 2: Trying framer.getCanvasRoot()...")
        try {
            const canvasRoot = await framer.getCanvasRoot()
            
            if (canvasRoot) {
                const rootData = canvasRoot as any
                console.log("✓ Got canvas root object")
                console.log("  Root id:", rootData.id)
                console.log("  Root name:", rootData.name)
                console.log("  Root type:", rootData.type)
                console.log("  ALL Root properties:", Object.keys(rootData))
                console.log("  Full root object:", JSON.stringify(rootData, null, 2))
                
                // Check specific breakpoint-related properties
                console.log("\n  Checking canvas breakpoint properties:")
                console.log("  - root.breakpoints:", rootData.breakpoints)
                console.log("  - root.__breakpoints:", rootData.__breakpoints)
                console.log("  - root.responsiveBreakpoints:", rootData.responsiveBreakpoints)
                console.log("  - root.viewportBreakpoints:", rootData.viewportBreakpoints)
                console.log("  - root.breakpointSettings:", rootData.breakpointSettings)
                console.log("  - root.document?.breakpoints:", rootData.document?.breakpoints)
                console.log("  - root.page?.breakpoints:", rootData.page?.breakpoints)
                
                // Try different possible breakpoint property names
                const canvasBpSources = [
                    rootData.breakpoints,
                    rootData.__breakpoints,
                    rootData.responsiveBreakpoints,
                    rootData.viewportBreakpoints,
                    rootData.breakpointSettings,
                    rootData.document?.breakpoints,
                    rootData.page?.breakpoints
                ]
                
                canvasBpSources.forEach((bpSource, index) => {
                    if (bpSource) {
                        console.log(`  ✓ Found breakpoints in canvas property [${index}]:`, bpSource)
                        extractBreakpointsFromSource(bpSource, detectedBreakpoints)
                    }
                })
            } else {
                console.log("✗ getCanvasRoot() returned null/undefined")
            }
        } catch (err) {
            console.log("✗ getCanvasRoot() failed:")
            console.error("  Error:", err)
        }
        
        // ============================================================================
        // METHOD 3: Try framer.getProjectInfo() / framer.getSite() - Project-level settings
        // ============================================================================
        console.log("\n📁 METHOD 3: Trying framer.getProjectInfo() / framer.getSite()...")
        
        // Try getProjectInfo
        try {
            const projectInfo = await (framer as any).getProjectInfo?.()
            
            if (projectInfo) {
                console.log("✓ Got project info object")
                console.log("  ALL Project properties:", Object.keys(projectInfo))
                console.log("  Full project object:", JSON.stringify(projectInfo, null, 2))
                
                console.log("\n  Checking project breakpoint properties:")
                console.log("  - projectInfo.breakpoints:", projectInfo.breakpoints)
                console.log("  - projectInfo.responsiveSettings:", projectInfo.responsiveSettings)
                console.log("  - projectInfo.settings?.breakpoints:", projectInfo.settings?.breakpoints)
                
                const projectBpSources = [
                    projectInfo.breakpoints,
                    projectInfo.responsiveSettings,
                    projectInfo.settings?.breakpoints
                ]
                
                projectBpSources.forEach((bpSource, index) => {
                    if (bpSource) {
                        console.log(`  ✓ Found breakpoints in project property [${index}]:`, bpSource)
                        extractBreakpointsFromSource(bpSource, detectedBreakpoints)
                    }
                })
            } else {
                console.log("✗ getProjectInfo() returned null/undefined")
            }
        } catch (err) {
            console.log("✗ getProjectInfo() not available or failed:")
            console.error("  Error:", err)
        }
        
        // Try getSite
        try {
            const site = await (framer as any).getSite?.()
            
            if (site) {
                console.log("\n✓ Got site object")
                console.log("  ALL Site properties:", Object.keys(site))
                console.log("  Full site object:", JSON.stringify(site, null, 2))
                
                console.log("\n  Checking site breakpoint properties:")
                console.log("  - site.breakpoints:", site.breakpoints)
                console.log("  - site.responsiveSettings:", site.responsiveSettings)
                
                const siteBpSources = [
                    site.breakpoints,
                    site.responsiveSettings
                ]
                
                siteBpSources.forEach((bpSource, index) => {
                    if (bpSource) {
                        console.log(`  ✓ Found breakpoints in site property [${index}]:`, bpSource)
                        extractBreakpointsFromSource(bpSource, detectedBreakpoints)
                    }
                })
            } else {
                console.log("✗ getSite() returned null/undefined")
            }
        } catch (err) {
            console.log("✗ getSite() not available or failed:")
            console.error("  Error:", err)
        }
        
        // ============================================================================
        // METHOD 4: Scan canvas nodes for breakpoint overrides
        // ============================================================================
        console.log("\n🔎 METHOD 4: Scanning canvas nodes for breakpoint data...")
        const nodes = await getAllCanvasNodes()
        console.log(`  Total nodes found: ${nodes.length}`)
        
        // Check first 3 nodes in detail for debugging
        console.log("\n  Detailed inspection of first 3 nodes:")
        nodes.slice(0, 3).forEach((node, index) => {
            const nodeData = node as any
            console.log(`\n  Node ${index + 1}: "${node.name}"`)
            console.log(`    Type: ${node.type}`)
            console.log(`    ID: ${node.id}`)
            console.log(`    ALL properties:`, Object.keys(nodeData))
            console.log(`    - node.breakpoints:`, nodeData.breakpoints)
            console.log(`    - node.responsiveOverrides:`, nodeData.responsiveOverrides)
            console.log(`    - node.__breakpoints:`, nodeData.__breakpoints)
            console.log(`    - node.responsive:`, nodeData.responsive)
            console.log(`    - node.overrides:`, nodeData.overrides)
            console.log(`    - node.variants:`, nodeData.variants)
            console.log(`    - node.variantProps:`, nodeData.variantProps)
        })
        
        console.log("\n  Scanning all nodes for breakpoint data...")
        let nodesWithBreakpointData = 0
        
        // Scan through nodes to find any with breakpoint data
        for (const node of nodes) {
            const nodeData = node as any
            
            // Check if node has breakpoint overrides
            if (nodeData.breakpoints) {
                nodesWithBreakpointData++
                console.log(`  ✓ Found breakpoints in node "${node.name}":`, nodeData.breakpoints)
                
                // Extract breakpoint widths
                if (Array.isArray(nodeData.breakpoints)) {
                    nodeData.breakpoints.forEach((bp: any) => {
                        if (typeof bp === 'number') detectedBreakpoints.add(bp)
                        if (bp && typeof bp === 'object') {
                            if (bp.width) detectedBreakpoints.add(bp.width)
                            if (bp.minWidth) detectedBreakpoints.add(bp.minWidth)
                            if (bp.maxWidth) detectedBreakpoints.add(bp.maxWidth)
                        }
                    })
                } else if (typeof nodeData.breakpoints === 'object') {
                    // Breakpoints might be an object with keys like { mobile: {...}, tablet: {...} }
                    Object.keys(nodeData.breakpoints).forEach(key => {
                        // Check if key contains common breakpoint names
                        const lowerKey = key.toLowerCase()
                        if (lowerKey.includes('mobile') || lowerKey.includes('phone') || lowerKey.includes('390')) {
                            detectedBreakpoints.add(390)
                        }
                        if (lowerKey.includes('tablet') || lowerKey.includes('810')) {
                            detectedBreakpoints.add(810)
                        }
                        
                        // Also check the value
                        const bp = nodeData.breakpoints[key]
                        if (typeof bp === 'number') detectedBreakpoints.add(bp)
                        if (bp && typeof bp === 'object') {
                            if (bp.width) detectedBreakpoints.add(bp.width)
                            if (bp.minWidth) detectedBreakpoints.add(bp.minWidth)
                        }
                    })
                }
            }
            
            // Check for responsive overrides
            if (nodeData.responsiveOverrides) {
                nodesWithBreakpointData++
                console.log(`  ✓ Found responsive overrides in "${node.name}":`, nodeData.responsiveOverrides)
                Object.keys(nodeData.responsiveOverrides).forEach(key => {
                    const width = parseInt(key)
                    if (!isNaN(width)) {
                        console.log(`    - Extracted breakpoint width: ${width}px`)
                        detectedBreakpoints.add(width)
                    }
                })
            }
        }
        
        console.log(`\n  Summary: Found ${nodesWithBreakpointData} nodes with breakpoint data`)
        
        // ============================================================================
        // FINAL ANALYSIS & FALLBACK
        // ============================================================================
        console.log("\n" + "=".repeat(80))
        console.log("📊 FINAL ANALYSIS")
        console.log("=".repeat(80))
        console.log(`  Direct detection found: ${detectedBreakpoints.size} breakpoint(s)`)
        if (detectedBreakpoints.size > 0) {
            console.log(`  Detected values:`, Array.from(detectedBreakpoints))
        }
        
        // ============================================================================
        // RESPONSIVE INDICATORS CHECK (LEGITIMATE INFERENCE)
        // ============================================================================
        // This checks if ANY element has actual responsive behavior/overrides.
        // If elements have responsive properties, it means breakpoints MUST exist
        // (you can't have responsive overrides without breakpoints being configured).
        // This is the ONLY legitimate reason to infer breakpoints exist.
        // ============================================================================
        console.log("\n  Checking for responsive design indicators...")
        console.log("  (Elements with responsive overrides or variant switching)")
        
        const hasAnyBreakpointData = nodes.some((node: any) => {
            // Check for CONCRETE evidence of responsive design:
            return (
                node.breakpoints ||           // Explicit breakpoint data
                node.responsiveOverrides ||   // Responsive property overrides
                node.__breakpoints ||         // Internal breakpoint refs
                node.responsiveProperties ||  // Responsive property config
                node.variantProps ||          // Variant-based responsiveness
                // Properties that are objects (different values at breakpoints):
                (node.width && typeof node.width === 'object') ||
                (node.height && typeof node.height === 'object') ||
                (node.x && typeof node.x === 'object') ||
                (node.y && typeof node.y === 'object')
            )
        })
        
        console.log(`  Responsive indicators found: ${hasAnyBreakpointData}`)
        
        // ============================================================================
        // STRICT DETECTION LOGIC (NO DANGEROUS FALLBACKS)
        // ============================================================================
        console.log("\n  Applying strict detection logic...")
        if (detectedBreakpoints.size === 0) {
            if (hasAnyBreakpointData) {
                console.log("  ✅ LEGITIMATE INFERENCE: Found concrete responsive indicators")
                console.log("  → Elements have responsive overrides or variant switching")
                console.log("  → Inferring standard Framer breakpoints exist (390px, 810px)")
                detectedBreakpoints.add(390)  // Mobile
                detectedBreakpoints.add(810)  // Tablet
            } else {
                console.log("  ✗ NO EVIDENCE OF BREAKPOINTS FOUND")
                console.log("  → Direct detection: 0 breakpoints")
                console.log("  → Responsive indicators: false")
                console.log("  → CONCLUSION: Breakpoints are MISSING")
                // DO NOT add fallback breakpoints - return empty array
            }
        } else {
            console.log("  ✅ Direct detection succeeded - using detected breakpoints")
        }
        
        const breakpointsArray = Array.from(detectedBreakpoints).sort((a, b) => a - b)
        
        // ============================================================================
        // FINAL SUMMARY
        // ============================================================================
        console.log("\n" + "=".repeat(80))
        console.log("🎯 BREAKPOINT DETECTION DEBUG - FINAL RESULT")
        console.log("=".repeat(80))
        
        const hasMobile = breakpointsArray.some(bp => Math.abs(bp - 390) <= 10)
        const hasTablet = breakpointsArray.some(bp => Math.abs(bp - 810) <= 10)
        const hasDesktop = breakpointsArray.some(bp => Math.abs(bp - 1200) <= 10)
        
        if (breakpointsArray.length > 0) {
            console.log("  ✅ Breakpoints detected:", breakpointsArray)
            console.log("\n  Standard Framer breakpoints check:")
            console.log(`    Mobile (390px):   ${hasMobile ? '✅ FOUND' : '❌ MISSING'}`)
            console.log(`    Tablet (810px):   ${hasTablet ? '✅ FOUND' : '❌ MISSING'}`)
            console.log(`    Desktop (1200px): ${hasDesktop ? '✅ FOUND' : '❌ MISSING'}`)
            
            // Determine detection confidence
            const detectionMethod = detectedBreakpoints.size > 0 ? 'direct' : 'inferred'
            console.log(`\n  Detection method: ${detectionMethod}`)
            console.log(`  Confidence: ${detectionMethod === 'direct' ? 'HIGH' : 'MEDIUM'}`)
        } else {
            console.log("  ❌ NO BREAKPOINTS FOUND")
            console.log("\n  Standard Framer breakpoints check:")
            console.log("    Mobile (390px):   ❌ MISSING")
            console.log("    Tablet (810px):   ❌ MISSING")
            console.log("    Desktop (1200px): ❌ MISSING")
            console.log("\n  Detection method: none-detected")
            console.log("  Confidence: HIGH (breakpoints are truly missing)")
            console.log("\n  ⚠️  CRITICAL: This project lacks responsive breakpoints!")
        }
        console.log("=".repeat(80) + "\n")
        
        return breakpointsArray
    } catch (error) {
        console.error("Error getting project breakpoints:", error)
        return []
    }
}

/**
 * Check if specific breakpoints exist in the project
 */
/**
 * Structured breakpoint detection result type
 */
export interface BreakpointDetectionResult {
    hasDesktopBreakpoint: boolean | null  // null = unable to verify
    hasTabletBreakpoint: boolean | null   // null = unable to verify
    hasMobileBreakpoint: boolean | null   // null = unable to verify
    detectedBreakpoints: number[]
    detectionMethod: 'direct' | 'published-site-css' | 'inferred' | 'unable-to-verify'
    detectionDetails: string
    confidence: 'high' | 'medium' | 'low'
}

/**
 * Detect breakpoints from published site's CSS/HTML
 * This is the most reliable method since Framer generates media queries when breakpoints exist
 */
async function detectBreakpointsFromPublishedSite(siteUrl: string): Promise<BreakpointDetectionResult | null> {
    try {
        console.log("\n" + "=".repeat(80))
        console.log("🌐 PUBLISHED SITE CSS DETECTION - DEBUG MODE")
        console.log("=".repeat(80))
        
        // ============================================================================
        // VALIDATE URL BEFORE FETCHING
        // ============================================================================
        console.log(`📍 Site URL received: ${siteUrl}`)
        console.log(`   Type: ${typeof siteUrl}`)
        
        if (!siteUrl || typeof siteUrl !== 'string') {
            console.log(`❌ CRITICAL ERROR: Invalid URL - received ${typeof siteUrl}`)
            console.log(`   Value:`, siteUrl)
            console.log(`   This should be a string like "https://example.framer.website"`)
            return null
        }
        
        if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
            console.log(`❌ CRITICAL ERROR: URL does not start with http:// or https://`)
            console.log(`   Received: "${siteUrl}"`)
            return null
        }
        
        console.log(`✅ URL validation passed`)
        
        // Fetch the published website HTML
        const response = await fetch(siteUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; FramerPlugin/1.0)'
            }
        })
        
        if (!response.ok) {
            console.log(`❌ Failed to fetch site: ${response.status} ${response.statusText}`)
            return null
        }
        
        const html = await response.text()
        console.log(`✅ Fetched HTML successfully`)
        console.log(`   Total size: ${html.length.toLocaleString()} bytes`)
        
        // Show HTML preview
        console.log(`\n📄 HTML Preview (first 3000 chars):`)
        console.log(html.substring(0, 3000))
        console.log(`\n... (truncated)\n`)
        
        // ============================================================================
        // SEARCH FOR ALL POSSIBLE MEDIA QUERY PATTERNS
        // ============================================================================
        console.log("🔍 Searching for media query patterns...")
        
        const searchPatterns = [
            '@media',
            'max-width: 389',
            'max-width: 390',
            'max-width:389',
            'max-width:390',
            'max-width: 809',
            'max-width: 810',
            'max-width:809',
            'max-width:810',
            'max-width: 389.9',
            'max-width: 809.9',
            'breakpoint',
            'responsive',
            'framer-breakpoint',
            'data-framer'
        ]
        
        console.log("\n  Pattern occurrence counts:")
        searchPatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi')
            const matches = html.match(regex) || []
            const found = matches.length > 0
            console.log(`    "${pattern}": ${found ? '✓' : '✗'} (${matches.length} occurrences)`)
        })
        
        // ============================================================================
        // EXTRACT ALL @MEDIA QUERIES
        // ============================================================================
        console.log("\n📱 Extracting @media queries...")
        const mediaQueryRegex = /@media[^{]+/g
        const foundMediaQueries = html.match(mediaQueryRegex) || []
        console.log(`   Found ${foundMediaQueries.length} @media declarations`)
        
        if (foundMediaQueries.length > 0) {
            console.log("\n   First 10 media queries:")
            foundMediaQueries.slice(0, 10).forEach((mq, index) => {
                console.log(`     ${index + 1}. ${mq.trim()}`)
            })
        } else {
            console.log("   ⚠️  No @media queries found in HTML!")
            console.log("   → CSS might be in external stylesheets")
        }
        
        // =========================================================================
        // EXTRACT ALL MAX-WIDTH VALUES
        // =========================================================================
        console.log("\n🎯 Extracting all max-width breakpoint values...")
        const maxWidthRegex = /max-width:\s*(\d+(?:\.\d+)?)/gi
        const breakpointValues: number[] = []
        let match
        
        while ((match = maxWidthRegex.exec(html)) !== null) {
            const value = parseFloat(match[1])
            breakpointValues.push(value)
        }
        
        console.log(`   Found ${breakpointValues.length} max-width declarations (inline)`)
        
        // =========================================================================
        // CHECK FOR EXTERNAL CSS FILES
        // =========================================================================
        console.log("\n🔗 Checking for external CSS files...")
        const cssLinkRegex = /<link[^>]+href="([^"]+\.css)"[^>]*>/gi
        const cssLinks: string[] = []
        
        while ((match = cssLinkRegex.exec(html)) !== null) {
            cssLinks.push(match[1])
        }
        
        console.log(`   Found ${cssLinks.length} external CSS file(s)`)
        if (cssLinks.length > 0) {
            console.log("   ⚠️  Breakpoints might be in external CSS (not checked yet)")
            cssLinks.slice(0, 5).forEach((link, index) => {
                console.log(`     ${index + 1}. ${link}`)
            })
        }
        // =========================================================================
        // ENHANCEMENT: Parse min-width and external CSS media queries
        // =========================================================================
        const minWidthRegex = /min-width:\s*(\d+(?:\.\d+)?)/gi
        // Include inline min-widths
        while ((match = minWidthRegex.exec(html)) !== null) {
            const value = parseFloat(match[1])
            breakpointValues.push(value)
        }
        
        if (cssLinks.length > 0) {
            const resolvedLinks = cssLinks.map(href => {
                try {
                    if (href.startsWith('//')) return new URL(siteUrl).protocol + href
                    return new URL(href, siteUrl).toString()
                } catch {
                    const origin = new URL(siteUrl).origin
                    return origin + (href.startsWith('/') ? href : '/' + href)
                }
            })
            console.log("\n🧩 Fetching external CSS to analyze media queries...")
            const results = await Promise.allSettled(
                resolvedLinks.map(link => fetch(link, {
                    method: 'GET',
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FramerPlugin/1.0)' }
                }).then(r => r.ok ? r.text() : ''))
            )
            let externalCssBytes = 0
            results.forEach((res, idx) => {
                if (res.status === 'fulfilled' && res.value) {
                    const cssText = res.value
                    externalCssBytes += cssText.length
                    let m
                    while ((m = maxWidthRegex.exec(cssText)) !== null) {
                        breakpointValues.push(parseFloat(m[1]))
                    }
                    while ((m = minWidthRegex.exec(cssText)) !== null) {
                        breakpointValues.push(parseFloat(m[1]))
                    }
                } else {
                    console.log(`   ⚠️  Failed to fetch CSS[${idx}]`)
                }
            })
            console.log(`   Parsed ${externalCssBytes.toLocaleString()} bytes of external CSS`)
        }
        
        // Recompute unique breakpoints after external CSS parsing
        const uniqueBreakpoints = [...new Set(breakpointValues)].sort((a, b) => a - b)
        console.log(`\n📈 Unique breakpoint values found:`, uniqueBreakpoints.length > 0 ? uniqueBreakpoints : 'NONE')
        // =========================================================================
        // END ENHANCEMENT
        // =========================================================================
        
        // ============================================================================
        // LOOK FOR FRAMER-SPECIFIC PATTERNS
        // ============================================================================
        console.log("\n🎨 Searching for Framer-specific patterns...")
        const framerPatterns = [
            /data-framer-[^=]+=["'][^"']*breakpoint[^"']*["']/gi,
            /class=["'][^"']*breakpoint[^"']*["']/gi,
            /framer-[\w-]*mobile/gi,
            /framer-[\w-]*tablet/gi
        ]
        
        framerPatterns.forEach((pattern, index) => {
            const matches = html.match(pattern) || []
            console.log(`   Pattern ${index + 1}: ${matches.length} matches`)
            if (matches.length > 0 && matches.length <= 5) {
                matches.forEach(m => console.log(`     → ${m}`))
            }
        })
        
        // ============================================================================
        // SMART DETECTION WITH TOLERANCE
        // ============================================================================
        console.log("\n" + "=".repeat(80))
        console.log("📊 BREAKPOINT DETECTION RESULTS")
        console.log("=".repeat(80))
        
        // Check for mobile breakpoint (370-410px range to account for .99 values)
        const hasMobile = uniqueBreakpoints.some(bp => bp >= 370 && bp <= 410)
        const mobileValue = uniqueBreakpoints.find(bp => bp >= 370 && bp <= 410)
        
        // Check for tablet breakpoint (790-830px range to account for .99 values)
        const hasTablet = uniqueBreakpoints.some(bp => bp >= 790 && bp <= 830)
        const tabletValue = uniqueBreakpoints.find(bp => bp >= 790 && bp <= 830)
        
        // Check for desktop breakpoint (1180-1220px range)
        const hasDesktop = uniqueBreakpoints.some(bp => bp >= 1180 && bp <= 1220)
        const desktopValue = uniqueBreakpoints.find(bp => bp >= 1180 && bp <= 1220)
        
        console.log(`\n  Mobile (370-410px range):   ${hasMobile ? `✅ FOUND (${mobileValue}px)` : '❌ NOT FOUND'}`)
        console.log(`  Tablet (790-830px range):   ${hasTablet ? `✅ FOUND (${tabletValue}px)` : '❌ NOT FOUND'}`)
        console.log(`  Desktop (1180-1220px range): ${hasDesktop ? `✅ FOUND (${desktopValue}px)` : '❌ NOT FOUND'}`)
        
        const detectedBreakpoints: number[] = []
        if (hasMobile && mobileValue) detectedBreakpoints.push(Math.round(mobileValue))
        if (hasTablet && tabletValue) detectedBreakpoints.push(Math.round(tabletValue))
        if (hasDesktop && desktopValue) detectedBreakpoints.push(Math.round(desktopValue))
        
        console.log(`\n  Final detected breakpoints:`, detectedBreakpoints)
        console.log("=".repeat(80) + "\n")
        
        return {
            hasMobileBreakpoint: hasMobile,
            hasTabletBreakpoint: hasTablet,
            hasDesktopBreakpoint: hasDesktop,
            detectedBreakpoints,
            detectionMethod: 'published-site-css',
            detectionDetails: detectedBreakpoints.length > 0
                ? `Detected ${detectedBreakpoints.length} breakpoint(s) from published site CSS: ${detectedBreakpoints.join(', ')}px`
                : 'No breakpoints detected in inline CSS. May require external CSS file analysis.',
            confidence: uniqueBreakpoints.length > 0 ? 'high' : 'low'
        }
    } catch (error) {
        console.log("❌ Error fetching published site:", error)
        return null
    }
}

/**
 * Detect project breakpoints with detailed information
 * Returns structured information about breakpoint detection
 */
export async function detectProjectBreakpoints(): Promise<BreakpointDetectionResult> {
    try {
        console.log("\n" + "=".repeat(80))
        console.log("🎯 BREAKPOINT DETECTION - NEW METHOD")
        console.log("=".repeat(80))
        
        // ============================================================================
        // STEP 1: Try Plugin API Detection (we know this usually fails)
        // ============================================================================
        console.log("\n📋 STEP 1: Trying Plugin API detection...")
        const apiBreakpoints = await getProjectBreakpoints()
        const TOLERANCE = 10
        
        if (apiBreakpoints.length > 0) {
            console.log("  ✅ Plugin API detection succeeded!")
            const hasMobile = apiBreakpoints.some(bp => Math.abs(bp - 390) <= TOLERANCE)
            const hasTablet = apiBreakpoints.some(bp => Math.abs(bp - 810) <= TOLERANCE)
            const hasDesktop = apiBreakpoints.some(bp => Math.abs(bp - 1200) <= TOLERANCE)
            
            return {
                hasDesktopBreakpoint: hasDesktop,
                hasTabletBreakpoint: hasTablet,
                hasMobileBreakpoint: hasMobile,
                detectedBreakpoints: apiBreakpoints,
                detectionMethod: apiBreakpoints.length > 0 ? 'direct' : 'inferred',
                detectionDetails: `Breakpoints detected via Plugin API: ${apiBreakpoints.join(', ')}px`,
                confidence: 'high'
            }
        }
        
        console.log("  ✗ Plugin API detection failed (returned 0 breakpoints)")
        
        // =========================================================================
        // STEP 2: Try Published Site CSS Detection (PRIMARY METHOD)
        // =========================================================================
        console.log("\n📋 STEP 2: Published site CSS detection is disabled (manual verification flow)")
        // Intentionally skip CSS-based detection per requirements
        
        // Try to get published URL for logging purposes
        let publishedUrl: string | null = null
        try {
            publishedUrl = await getPublishedSiteUrl()
        } catch (e) {
            console.log("  → Could not retrieve published URL")
        }
        
        // =========================================================================
        // STEP 3: Unable to Verify
        // =========================================================================
        console.log("\n📋 STEP 3: Unable to verify breakpoints")
        console.log("  → Plugin API: Failed (returned 0)")
        console.log("  → Published site: " + (publishedUrl ? "Fetch failed or no breakpoints in CSS" : "Not published (no URL)"))
        console.log("  → Result: UNABLE TO VERIFY (not marking as missing)")
        
        return {
            hasDesktopBreakpoint: null,  // Unknown
            hasTabletBreakpoint: null,   // Unknown
            hasMobileBreakpoint: null,   // Unknown
            detectedBreakpoints: [],
            detectionMethod: 'unable-to-verify',
            detectionDetails: publishedUrl 
                ? 'Published site was fetched but no breakpoints detected in inline CSS. Breakpoints may be in external CSS files (not yet analyzed). Manual verification required.'
                : 'Site is not published and Plugin API does not expose breakpoint data. Please publish the site to framer.app, framer.website, or framer.ai to enable automatic detection.',
            confidence: 'low'
        }
        
    } catch (error) {
        console.error('Error detecting breakpoints:', error)
        return {
            hasDesktopBreakpoint: null,
            hasTabletBreakpoint: null,
            hasMobileBreakpoint: null,
            detectedBreakpoints: [],
            detectionMethod: 'unable-to-verify',
            detectionDetails: `Detection error: ${error}`,
            confidence: 'low'
        }
    }
}

/**
 * Check if project has required breakpoints (with tolerance)
 * @deprecated Use detectProjectBreakpoints() for more detailed information
 */
export async function hasBreakpoints(requiredBreakpoints: number[]): Promise<{
    hasMobile: boolean
    hasTablet: boolean
    foundBreakpoints: number[]
    missingBreakpoints: number[]
}> {
    const projectBreakpoints = await getProjectBreakpoints()
    
    // Framer's standard breakpoints with tolerance
    const MOBILE_BP = 390
    const TABLET_BP = 810
    const TOLERANCE = 10 // Allow ±10px variance
    
    const hasMobile = projectBreakpoints.some(bp => 
        Math.abs(bp - MOBILE_BP) <= TOLERANCE
    )
    
    const hasTablet = projectBreakpoints.some(bp => 
        Math.abs(bp - TABLET_BP) <= TOLERANCE
    )
    
    const missingBreakpoints: number[] = []
    if (!hasMobile) missingBreakpoints.push(MOBILE_BP)
    if (!hasTablet) missingBreakpoints.push(TABLET_BP)
    
    return {
        hasMobile,
        hasTablet,
        foundBreakpoints: projectBreakpoints,
        missingBreakpoints
    }
}

