/**
 * Part 3-6: Complete Responsiveness Checker - Usage Examples
 * 
 * This file demonstrates:
 * - Part 3: Variant Detection
 * - Part 4: Internal Breakpoint Detection
 * - Part 5: Flexible Layout Detection
 * - Part 6: Enhanced Issue Reporting
 */

import {
    checkForResponsiveVariants,
    isComponentResponsiveDetailed,
    checkInternalBreakpoints,
    checkFlexibleLayoutProperties,
    runCompleteResponsivenessCheck,
    type VariantDetectionResult,
    type ResponsiveDetectionResult,
    type InternalBreakpointResult,
    type FlexibleLayoutResult,
    type ResponsivenessIssue,
    type IssueContext
} from './src/lib/checkers/responsivenessChecker'

// Example 1: Check for responsive variants on a component
async function example1_BasicVariantDetection(componentNode: any) {
    const result: VariantDetectionResult = await checkForResponsiveVariants(componentNode)
    
    if (result.detected) {
        console.log(`Responsive variants detected!`)
        console.log(`Method: ${result.method}`)
        console.log(`Confidence: ${result.confidence}`)
        
        if (result.method === "variant-based" && result.variants) {
            console.log(`Variant names: ${result.variants.join(", ")}`)
        }
        
        if (result.method === "variant-switching" && result.switchingBreakpoints) {
            console.log(`Switching at breakpoints: ${result.switchingBreakpoints.join(", ")}`)
        }
    } else {
        console.log("No responsive variants detected")
    }
}

// Example 2: Detailed responsive detection
async function example2_DetailedResponsiveDetection(componentNode: any) {
    const result: ResponsiveDetectionResult = await isComponentResponsiveDetailed(componentNode)
    
    console.log(`Is responsive: ${result.isResponsive}`)
    console.log(`Confidence: ${result.confidence}`)
    console.log(`Detection methods: ${result.methods.join(", ")}`)
    
    if (result.variantInfo?.detected) {
        console.log(`Variant detection: ${result.variantInfo.method}`)
        if (result.variantInfo.variants) {
            console.log(`Variants: ${result.variantInfo.variants.join(", ")}`)
        }
    }
}

// Example 3: Check component with high confidence variants
async function example3_HighConfidenceVariants() {
    const componentNode = {
        variants: [
            { name: "Desktop" },
            { name: "Tablet" },
            { name: "Mobile" }
        ]
    }
    
    const result = await checkForResponsiveVariants(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "variant-based",
    //   variants: ["Desktop", "Tablet", "Mobile"],
    //   confidence: "high"
    // }
    
    console.log(result)
}

// Example 4: Check component with variant switching
async function example4_VariantSwitching() {
    const componentNode = {
        breakpoints: {
            tablet: {
                variant: "TabletView"
            },
            mobile: {
                variant: "MobileView"
            }
        }
    }
    
    const result = await checkForResponsiveVariants(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "variant-switching",
    //   switchingBreakpoints: ["tablet", "mobile"],
    //   confidence: "high"
    // }
    
    console.log(result)
}

// Example 5: Integration with audit flow
async function example5_AuditIntegration(nodes: any[]) {
    const results = []
    
    for (const node of nodes) {
        // Check if it's a component
        if (node.type === "component" || node.componentIdentifier) {
            // Use detailed detection
            const detection = await isComponentResponsiveDetailed(node)
            
            results.push({
                name: node.name,
                isResponsive: detection.isResponsive,
                confidence: detection.confidence,
                methods: detection.methods,
                variantInfo: detection.variantInfo
            })
        }
    }
    
    // Filter to only high-confidence responsive components
    const highConfidenceResponsive = results.filter(
        r => r.isResponsive && r.confidence === "high"
    )
    
    console.log(`Found ${highConfidenceResponsive.length} high-confidence responsive components`)
    
    return results
}

// Example 6: Custom variant keyword detection
async function example6_CustomKeywordDetection(componentNode: any) {
    const result = await checkForResponsiveVariants(componentNode)
    
    // The function automatically detects these patterns:
    // - "mobile", "tablet", "desktop"
    // - "sm", "md", "lg", "xl"
    // - "phone", "ipad", "small", "large"
    // - "390", "810", "1200" (breakpoint sizes)
    
    if (result.detected && result.variants) {
        // Analyze which keywords were matched
        const keywords = ["mobile", "tablet", "desktop", "sm", "md", "lg", "xl", "phone", "ipad", "390", "810", "1200"]
        const matchedKeywords = keywords.filter(keyword =>
            result.variants!.some(variant => variant.toLowerCase().includes(keyword))
        )
        
        console.log(`Matched keywords: ${matchedKeywords.join(", ")}`)
    }
}

// PART 4 EXAMPLES: Internal Breakpoint Detection

// Example 7: Check internal breakpoints via component definition
async function example7_ComponentDefinitionBreakpoints(componentNode: any) {
    const result: InternalBreakpointResult = await checkInternalBreakpoints(componentNode)
    
    if (result.detected) {
        console.log(`Internal breakpoints detected!`)
        console.log(`Method: ${result.method}`)
        console.log(`Location: ${result.location}`)
        console.log(`Breakpoints: ${result.breakpoints?.join(", ")}`)
    } else {
        console.log("No internal breakpoints detected")
    }
}

// Example 8: Component instance with internal breakpoints
async function example8_ComponentInstanceBreakpoints() {
    const componentNode = {
        type: "component-instance",
        componentId: "abc123",
        children: [
            {
                name: "Text",
                breakpoints: {
                    mobile: { fontSize: 14 },
                    tablet: { fontSize: 16 }
                }
            },
            {
                name: "Image",
                breakpoints: {
                    mobile: { width: 300 },
                    tablet: { width: 500 }
                }
            }
        ]
    }
    
    const result = await checkInternalBreakpoints(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "children-breakpoints",
    //   breakpoints: [390, 810],
    //   location: "2 children"
    // }
    
    console.log(result)
}

// Example 9: Full detection with internal breakpoints
async function example9_FullDetectionWithInternalBreakpoints(componentNode: any) {
    const result: ResponsiveDetectionResult = await isComponentResponsiveDetailed(componentNode)
    
    console.log(`Is responsive: ${result.isResponsive}`)
    console.log(`Confidence: ${result.confidence}`)
    console.log(`Methods: ${result.methods.join(", ")}`)
    
    if (result.internalBreakpointInfo?.detected) {
        console.log(`\nInternal breakpoints found:`)
        console.log(`  Method: ${result.internalBreakpointInfo.method}`)
        console.log(`  Location: ${result.internalBreakpointInfo.location}`)
        console.log(`  Breakpoints: ${result.internalBreakpointInfo.breakpoints?.join(", ")}`)
    }
    
    if (result.variantInfo?.detected) {
        console.log(`\nVariants found:`)
        console.log(`  Method: ${result.variantInfo.method}`)
        console.log(`  Variants: ${result.variantInfo.variants?.join(", ")}`)
    }
}

// Example 10: Check component with Framer API access
async function example10_FramerAPIComponentDefinition(componentNode: any) {
    // This will attempt to use framer.getComponentDefinition if available
    const result = await checkInternalBreakpoints(componentNode)
    
    if (result.method === "component-definition") {
        console.log("✅ Successfully accessed component definition via Framer API")
        console.log(`Breakpoints: ${result.breakpoints?.join(", ")}`)
        console.log(`Location: ${result.location}`)
    } else if (result.method === "children-breakpoints") {
        console.log("ℹ️ Detected via children analysis (API not available)")
        console.log(`Breakpoints found in ${result.location}`)
    } else {
        console.log("❌ No internal breakpoints detected")
    }
}

// Example 11: Integration with audit flow including internal breakpoints
async function example11_CompleteAuditWithInternalBreakpoints(nodes: any[]) {
    const results = []
    
    for (const node of nodes) {
        // Check if it's a component
        if (node.type === "component" || node.componentIdentifier) {
            // Use full detailed detection
            const detection = await isComponentResponsiveDetailed(node)
            
            results.push({
                name: node.name,
                isResponsive: detection.isResponsive,
                confidence: detection.confidence,
                methods: detection.methods,
                hasVariants: detection.variantInfo?.detected || false,
                hasInternalBreakpoints: detection.internalBreakpointInfo?.detected || false,
                internalBreakpointMethod: detection.internalBreakpointInfo?.method,
                breakpointLocations: [
                    detection.internalBreakpointInfo?.location,
                    detection.variantInfo ? "variants" : null
                ].filter(Boolean)
            })
        }
    }
    
    // Analyze results
    const withInternalBreakpoints = results.filter(r => r.hasInternalBreakpoints)
    const withVariants = results.filter(r => r.hasVariants)
    const bothMethods = results.filter(r => r.hasInternalBreakpoints && r.hasVariants)
    
    console.log(`\nAudit Results:`)
    console.log(`Total components: ${results.length}`)
    console.log(`With internal breakpoints: ${withInternalBreakpoints.length}`)
    console.log(`With variants: ${withVariants.length}`)
    console.log(`Using both methods: ${bothMethods.length}`)
    
    return results
}

// PART 5 EXAMPLES: Flexible Layout Detection

// Example 12: Check flexible layout properties
function example12_FlexibleLayoutDetection(componentNode: any) {
    const result: FlexibleLayoutResult = checkFlexibleLayoutProperties(componentNode)
    
    if (result.detected) {
        console.log(`Flexible layout detected!`)
        console.log(`Confidence: ${result.confidence}`)
        console.log(`Properties:`, result.properties)
        
        if (result.properties?.flexProperties) {
            console.log(`Features: ${result.properties.flexProperties.join(", ")}`)
        }
    } else {
        console.log("No flexible layout properties detected")
    }
}

// Example 13: Component with Fill width
function example13_FillWidthComponent() {
    const componentNode = {
        widthType: "fill",
        layout: "stack",
        distribution: "space-between"
    }
    
    const result = checkFlexibleLayoutProperties(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "flexible-layout",
    //   properties: {
    //     widthType: "fill",
    //     layout: "stack",
    //     distribution: "space-between",
    //     flexProperties: ["flexible-width", "responsive-distribution"]
    //   },
    //   confidence: "medium"
    // }
    
    console.log(result)
}

// Example 14: Component with wrap enabled
function example14_WrapEnabledStack() {
    const componentNode = {
        type: "Stack",
        widthType: "fill",
        wrap: true,
        minWidth: 300,
        maxWidth: 1200
    }
    
    const result = checkFlexibleLayoutProperties(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "flexible-layout",
    //   properties: {
    //     widthType: "fill",
    //     layout: "stack",
    //     hasWrap: true,
    //     hasConstraints: true,
    //     flexProperties: ["flexible-width", "wrap-enabled", "width-constraints"]
    //   },
    //   confidence: "high"  // 3+ features
    // }
    
    console.log(result)
}

// Example 15: Centered and safe component
function example15_CenteredSafeComponent() {
    const componentNode = {
        horizontalAlign: "center",
        width: 450,
        widthType: "fixed"
    }
    
    const result = checkFlexibleLayoutProperties(componentNode)
    
    // Expected output:
    // {
    //   detected: true,
    //   method: "flexible-layout",
    //   properties: {
    //     centered: true,
    //     flexProperties: ["centered-safe"]
    //   },
    //   confidence: "low"
    // }
    
    console.log(result)
}

// Example 16: Full detection including flexible layout
async function example16_FullDetectionWithFlexibleLayout(componentNode: any) {
    const result: ResponsiveDetectionResult = await isComponentResponsiveDetailed(componentNode)
    
    console.log(`Is responsive: ${result.isResponsive}`)
    console.log(`Confidence: ${result.confidence}`)
    console.log(`Methods: ${result.methods.join(", ")}`)
    
    if (result.flexibleLayoutInfo?.detected) {
        console.log(`\nFlexible layout detected:`)
        console.log(`  Confidence: ${result.flexibleLayoutInfo.confidence}`)
        console.log(`  Features: ${result.flexibleLayoutInfo.properties?.flexProperties?.join(", ")}`)
        
        if (result.flexibleLayoutInfo.properties?.widthType) {
            console.log(`  Width type: ${result.flexibleLayoutInfo.properties.widthType}`)
        }
        if (result.flexibleLayoutInfo.properties?.distribution) {
            console.log(`  Distribution: ${result.flexibleLayoutInfo.properties.distribution}`)
        }
    }
}

// Example 17: Complete audit with all detection methods
async function example17_CompleteAudit(nodes: any[]) {
    const results = []
    
    for (const node of nodes) {
        if (node.type === "component" || node.componentIdentifier || node.type === "Stack") {
            const detection = await isComponentResponsiveDetailed(node)
            
            results.push({
                name: node.name,
                isResponsive: detection.isResponsive,
                confidence: detection.confidence,
                methods: detection.methods,
                hasVariants: detection.variantInfo?.detected || false,
                hasInternalBreakpoints: detection.internalBreakpointInfo?.detected || false,
                hasFlexibleLayout: detection.flexibleLayoutInfo?.detected || false,
                flexFeatures: detection.flexibleLayoutInfo?.properties?.flexProperties || [],
                summary: {
                    variants: detection.variantInfo?.variants?.length || 0,
                    breakpoints: detection.internalBreakpointInfo?.breakpoints?.length || 0,
                    flexProperties: detection.flexibleLayoutInfo?.properties?.flexProperties?.length || 0
                }
            })
        }
    }
    
    // Analyze results
    const responsive = results.filter(r => r.isResponsive)
    const highConfidence = results.filter(r => r.confidence === "high")
    const flexibleLayouts = results.filter(r => r.hasFlexibleLayout)
    
    console.log(`\nComplete Audit Results:`)
    console.log(`Total checked: ${results.length}`)
    console.log(`Responsive: ${responsive.length} (${Math.round(responsive.length / results.length * 100)}%)`)
    console.log(`High confidence: ${highConfidence.length}`)
    console.log(`With flexible layouts: ${flexibleLayouts.length}`)
    
    return results
}

// PART 6 EXAMPLES: Enhanced Issue Reporting

// Example 18: Read enhanced issue details
async function example18_EnhancedIssueReporting() {
    const result = await runCompleteResponsivenessCheck()
    
    console.log(`\nEnhanced Issue Reporting:`)
    console.log(`Total issues: ${result.issues.length}`)
    
    // Display each issue with full context
    result.issues.forEach((issue: ResponsivenessIssue, index: number) => {
        console.log(`\n--- Issue ${index + 1} ---`)
        console.log(`Severity: ${issue.severity}`)
        console.log(`Category: ${issue.category}`)
        console.log(`Breakpoint: ${issue.breakpoint}`)
        console.log(`Title: ${issue.title}`)
        console.log(`Description: ${issue.description}`)
        
        // Display context
        if (issue.context) {
            console.log(`\nContext:`)
            console.log(`  Component: ${issue.context.componentName} (${issue.context.componentType})`)
            console.log(`  Current Width: ${issue.context.currentWidth}px`)
            console.log(`  ${issue.breakpoint} Viewport: ${issue.context.mobileViewport || issue.context.tabletViewport}px`)
            console.log(`  Has Breakpoint: ${issue.context.hasBreakpoint}`)
            console.log(`  Has Variants: ${issue.context.hasVariants}`)
            console.log(`  Has Flexible Layout: ${issue.context.hasFlexibleLayout}`)
            
            if (issue.context.missingFeatures && issue.context.missingFeatures.length > 0) {
                console.log(`  Missing: ${issue.context.missingFeatures.join(", ")}`)
            }
        }
        
        // Display fix options
        console.log(`\nHow to Fix:`)
        console.log(issue.howToFix)
    })
}

// Example 19: Filter issues by severity
async function example19_FilterBySeverity() {
    const result = await runCompleteResponsivenessCheck()
    
    const critical = result.issues.filter(i => i.severity === "critical")
    const high = result.issues.filter(i => i.severity === "high")
    const medium = result.issues.filter(i => i.severity === "medium")
    
    console.log(`\nIssues by Severity:`)
    console.log(`Critical: ${critical.length}`)
    console.log(`High: ${high.length}`)
    console.log(`Medium: ${medium.length}`)
    
    // Show critical issues first
    if (critical.length > 0) {
        console.log(`\n🚨 Critical Issues:`)
        critical.forEach(issue => {
            console.log(`- ${issue.title}`)
            console.log(`  ${issue.description}`)
        })
    }
}

// Example 20: Group issues by breakpoint
async function example20_GroupByBreakpoint() {
    const result = await runCompleteResponsivenessCheck()
    
    const mobileIssues = result.issues.filter(i => i.breakpoint === "mobile")
    const tabletIssues = result.issues.filter(i => i.breakpoint === "tablet")
    const allBreakpointIssues = result.issues.filter(i => i.breakpoint === "all")
    
    console.log(`\nIssues by Breakpoint:`)
    console.log(`Mobile: ${mobileIssues.length}`)
    console.log(`Tablet: ${tabletIssues.length}`)
    console.log(`All: ${allBreakpointIssues.length}`)
    
    // Show mobile issues
    if (mobileIssues.length > 0) {
        console.log(`\n📱 Mobile Issues:`)
        mobileIssues.forEach(issue => {
            console.log(`- ${issue.context.componentName}: ${issue.description}`)
        })
    }
}

// Example 21: Analyze issue context
async function example21_AnalyzeContext() {
    const result = await runCompleteResponsivenessCheck()
    
    console.log(`\nContext Analysis:`)
    
    // Components without breakpoints
    const noBreakpoints = result.issues.filter(i => i.context.hasBreakpoint === false)
    console.log(`Components without breakpoints: ${noBreakpoints.length}`)
    
    // Components without variants
    const noVariants = result.issues.filter(i => i.context.hasVariants === false)
    console.log(`Components without variants: ${noVariants.length}`)
    
    // Components without flexible layout
    const noFlexLayout = result.issues.filter(i => i.context.hasFlexibleLayout === false)
    console.log(`Components without flexible layout: ${noFlexLayout.length}`)
    
    // Components missing all three
    const missingAll = result.issues.filter(i => 
        i.context.hasBreakpoint === false &&
        i.context.hasVariants === false &&
        i.context.hasFlexibleLayout === false
    )
    console.log(`\n❌ Components with NO responsive features: ${missingAll.length}`)
    if (missingAll.length > 0) {
        missingAll.forEach(issue => {
            console.log(`  - ${issue.context.componentName}`)
        })
    }
}

// Example 22: Compare with legacy format
async function example22_LegacyCompatibility() {
    const result = await runCompleteResponsivenessCheck()
    
    // New format (recommended)
    result.issues.forEach(issue => {
        console.log(`\n[New Format]`)
        console.log(`Severity: ${issue.severity}`)
        console.log(`Category: ${issue.category}`)
        console.log(`Context:`, issue.context)
        console.log(`Fix Options:\n${issue.howToFix}`)
        
        // Legacy format still accessible
        console.log(`\n[Legacy]`)
        console.log(`Impact: ${issue.impact}`)  // Same as severity
    })
}

// Example 23: Generate custom report from enhanced data
async function example23_CustomReport() {
    const result = await runCompleteResponsivenessCheck()
    
    const report = {
        score: result.score,
        timestamp: result.timestamp,
        summary: {
            totalIssues: result.issues.length,
            critical: result.issues.filter(i => i.severity === "critical").length,
            high: result.issues.filter(i => i.severity === "high").length,
            medium: result.issues.filter(i => i.severity === "medium").length
        },
        issuesByBreakpoint: {
            mobile: result.issues.filter(i => i.breakpoint === "mobile").length,
            tablet: result.issues.filter(i => i.breakpoint === "tablet").length,
            all: result.issues.filter(i => i.breakpoint === "all").length
        },
        componentAnalysis: {
            withoutBreakpoints: result.issues.filter(i => !i.context.hasBreakpoint).map(i => i.context.componentName),
            withoutVariants: result.issues.filter(i => !i.context.hasVariants).map(i => i.context.componentName),
            withoutFlexLayout: result.issues.filter(i => !i.context.hasFlexibleLayout).map(i => i.context.componentName)
        },
        recommendations: result.issues.slice(0, 3).map(issue => ({
            component: issue.context.componentName,
            severity: issue.severity,
            problem: issue.description,
            fixes: issue.howToFix.split('\n')
        }))
    }
    
    console.log(JSON.stringify(report, null, 2))
    
    return report
}

export {
    // Part 3 examples
    example1_BasicVariantDetection,
    example2_DetailedResponsiveDetection,
    example3_HighConfidenceVariants,
    example4_VariantSwitching,
    example5_AuditIntegration,
    example6_CustomKeywordDetection,
    // Part 4 examples
    example7_ComponentDefinitionBreakpoints,
    example8_ComponentInstanceBreakpoints,
    example9_FullDetectionWithInternalBreakpoints,
    example10_FramerAPIComponentDefinition,
    example11_CompleteAuditWithInternalBreakpoints,
    // Part 5 examples
    example12_FlexibleLayoutDetection,
    example13_FillWidthComponent,
    example14_WrapEnabledStack,
    example15_CenteredSafeComponent,
    example16_FullDetectionWithFlexibleLayout,
    example17_CompleteAudit,
    // Part 6 examples
    example18_EnhancedIssueReporting,
    example19_FilterBySeverity,
    example20_GroupByBreakpoint,
    example21_AnalyzeContext,
    example22_LegacyCompatibility,
    example23_CustomReport
}

