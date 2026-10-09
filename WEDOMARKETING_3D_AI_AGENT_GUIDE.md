# We Do Marketing - 3D Website Rebuild
## Full AI Agent Guide for a Next.js Marketing Agency Experience

> **Project type:** Premium, experimental, conversion-focused marketing agency website
>
> **Agency:** We Do Marketing / Wedomarketing
>
> **Existing website:** `https://wedomkg.com/`
>
> **Reference experience:** `https://www.findrealestate.com/`
>
> **Motion references:**
> - `https://www.instagram.com/p/DZdOFrNDx4i`
> - `https://www.instagram.com/reels/Dc9cPAtBmU9/`
>
> **Primary requirement:** This must be a genuinely 3D, scroll-driven website. Do not build a conventional agency landing page and add a few decorative animations afterward. The 3D scene, scrolling, storytelling, content, and interaction must feel like one designed experience.
>
> ---
>
> # 1. Mission
>
> Rebuild the We Do Marketing website as a modern digital experience that communicates one core idea:
>
> **We help businesses grow by turning marketing into movement, momentum, visibility, and results.**
>
> The existing brand message is built around:
>
> **We Grow Together.**
>
> Keep that spirit, but make the new website much more ambitious visually and interactively.
>
> The result should feel like a high-end creative/marketing studio website rather than a standard WordPress-style agency homepage.
>
> The visitor should be able to feel that:
>
> - the agency understands branding and communication
> - the agency can create digital experiences
> - the agency can make brands visible
> - the agency can move an idea from strategy to execution
> - the agency works collaboratively with its clients
> - the agency has real work and real clients
>
> The website should communicate this without becoming visually chaotic or turning into an animation demo.
>
> ---
>
> # 2. Non-negotiable requirements
>
> These requirements are mandatory.
>
> ## 2.1 It MUST be a 3D website
>
> Do not satisfy this requirement with:
>
> - a gradient background
> - a rotating SVG
> - one floating image
> - parallax cards only
> - a CSS pseudo-3D effect
> - a single decorative cube in the hero
>
> Use a real WebGL/Three.js scene through React Three Fiber.
>
> The 3D environment should remain relevant while the visitor scrolls and should change state across multiple sections.
>
> ## 2.2 Scrolling MUST control the experience
>
> Scrolling must have a purpose.
>
> Examples of scroll-controlled actions:
>
> - camera movement
> - object rotation
> - object transformation
> - object scaling
> - object separation/reassembly
> - lighting changes
> - depth movement
> - text entering/exiting 3D space
> - project previews appearing as surfaces/screens
> - particles moving along trajectories
> - service modules activating
> - trust elements converging around the core object
> - final CTA scene resolving into a complete form
>
> Never use animation only because it looks impressive. Each major motion should reinforce the current message.
>
> ## 2.3 Two languages are mandatory
>
> Support:
>
> - English
> - French
>
> The language control must be visible in the top-right area of the site.
>
> Use a compact language/globe icon. Clicking it should expose a clean English/French selector.
>
> Preferred labels:
>
> - `EN`
> - `FR`
>
> The selector should be elegant and minimal, not a large traditional dropdown.
>
> Language switching must preserve the current route/section when possible.
>
> Example:
>
> - `/en`
> - `/fr`
>
> Or an equivalent route architecture using the chosen i18n solution.
>
> Do not implement language switching by duplicating every component manually.
>
> Keep translatable content in dictionaries/data files.
>
> ## 2.4 All provided visual assets are local
>
> The project already contains the visual assets the new website should use.
>
> Main asset root:
>
> ```text
> /public/assets
> ```
>
> Website/project screenshots and work visuals:
>
> ```text
> /public/assets/web_images
> ```
>
> Client/trust images, including transparent-background assets intended for the trust section:
>
> ```text
> /public/assets/trust_us_images
> ```
>
> Before designing the final layout, inspect these directories recursively and understand what each asset represents.
>
> Do not invent filenames.
>
> Do not replace the provided visuals with random stock photos.
>
> Do not use Unsplash/Pexels/random image URLs as substitutes.
>
> Do not download unrelated photographs from the internet to fill gaps unless explicitly requested.
>
> Prefer the existing local assets even when their filenames are not descriptive.
>
> If necessary, create an internal asset manifest after inspecting the files.
>
> ---
>
> # 3. Existing agency identity and verified content
>
> The current public website is the authoritative source for the existing agency identity and core business information.
>
> Current navigation:
>
> - Home
> - About
> - Services
> - Works
> - Contact
>
> Current core headline:
>
> **We Grow Together.**
>
> Current supporting line:
>
> **Focus on your business, we do the rest.**
>
> Current agency description:
>
> We Do Marketing helps organizations from early-stage startups to big corporations meet their marketing goals. The agency works across industries including doctor offices, government-affiliated organizations, private hospitals, pharma, retailers, restaurants, e-commerce, and more. Its A-Z marketing solutions include web design, search engine marketing (PPC and SEO), social media management, video production, and 1:1 consulting.
>
> Current positioning statement for services:
>
> **We take pride in what we do. Our services are designed to help your business stand out and turn your ideas into reality.**
>
> ### Verified services
>
> #### Social Media Management
>
> Current offering includes account creation, management, content creation, and advertising campaigns. The service is customized to client goals and needs and is delivered through close collaboration with clients.
>
> #### Website Design / SEO
>
> Current offering includes responsive templates for e-commerce, portfolios, and blogs, plus SEO, custom design, and e-commerce solutions with personalized support.
>
> #### Online Advertising
>
> Current offering is built around understanding the audience, goals, and budget, then creating tailored campaigns across channels such as Google, Facebook, Instagram, TikTok, YouTube, and others. The current positioning emphasizes data-driven targeting and ROI.
>
> #### Influence Marketing
>
> Current offering focuses on influencer collaborations across Instagram, TikTok, YouTube, podcasts, blogs, and other platforms.
>
> ### Current portfolio / works
>
> The existing public website lists:
>
> 1. **Maison Kayser**
>    - `https://www.maison-kayser.ma/`
>
> 2. **Centre d'Ophtalmologie Ryad**
>    - `https://www.ophtalmoryad.ma/`
>
> 3. **Cartway**
>    - `https://www.cartway.ma/`
>
> 4. **German Syrian Dental Clinic**
>    - `https://www.gsdentalclinic.ma/`
>
> 5. **Divine Beauty Lounge**
>    - `https://www.dvinebeautelounge.com/`
>
> 6. **Athena Contractors**
>    - `https://athena-contractors.com/`
>
> ### Contact information currently verified from the public site
>
> **Email:** `contact@wedomkg.com`
>
> The current public homepage does not provide a verified phone number or physical address in its accessible content.
>
> **Do not invent a phone number, office address, social handle, team member names, statistics, awards, or client results.**
>
> If the local project contains additional contact data, use it only after verifying it against project files or a current source.
>
> Current footer copyright text:
>
> **© Copyright 2023 Wedomarketing**
>
> The new site may modernize the presentation and year, but do not fabricate historical facts.
>
> ---
>
> # 4. How to use the existing site data
>
> The rebuild is a redesign, not a change of company identity.
>
> Preserve the substance of the verified information while rewriting it for a stronger modern web experience.
>
> Do not simply copy the existing paragraphs into cards.
>
> Turn them into a clear narrative.
>
> A good content flow is:
>
> **Problem -> capability -> method -> proof -> invitation**
>
> Example logic:
>
> - businesses need attention and growth
> - We Do Marketing builds the systems that create that attention
> - those systems span social, web/SEO, paid advertising, and influence
> - the work section proves capability
> - client/trust visuals establish confidence
> - the contact section converts interest into a conversation
>
> ---
>
> # 5. Copywriting instructions for the AI agent
>
> This is extremely important.
>
> The copy should not sound like generic AI marketing copy.
>
> Avoid phrases such as:
>
> - “we are a leading agency”
> - “we take your business to the next level”
> - “unlock your potential”
> - “innovative solutions tailored to your needs”
> - “synergy”
> - “cutting-edge solutions”
> - “revolutionize your brand”
> - “where creativity meets technology”
>
> unless a specific piece of copy genuinely requires them and they are rewritten in a distinctive way.
>
> ## 5.1 Writing personality
>
> Write like a confident creative agency that knows what it is doing.
>
> Tone:
>
> - confident
> - sharp
> - human
> - modern
> - concise
> - strategic
> - visually aware
> - slightly provocative when useful
> - never arrogant
>
> The writing should feel like a creative director wrote it, not like an SEO article generator.
>
> ## 5.2 Sentence style
>
> Prefer short, memorable statements.
>
> Mix short headlines with slightly longer explanatory paragraphs.
>
> Use rhythm.
>
> For example, instead of:
>
> “Our company provides comprehensive marketing services that help our clients achieve their strategic business goals through customized digital marketing solutions.”
>
> Write something closer to:
>
> “You bring the business. We build the attention around it.”
>
> Then explain the capability underneath.
>
> ## 5.3 Be specific
>
> Use the actual services and industries found in the agency data.
>
> Mention real channels where relevant:
>
> - Google
> - Instagram
> - Facebook
> - TikTok
> - YouTube
> - podcasts
> - blogs
>
> Mention real portfolio projects.
>
> Do not invent fake campaign metrics or performance statistics.
>
> ## 5.4 Build one narrative around growth
>
> Use the existing “We Grow Together” idea as a conceptual foundation.
>
> The new website should explore growth in a more visual way:
>
> **attention -> connection -> movement -> growth**
>
> The words and visuals should reinforce this journey.
>
> ## 5.5 English and French are separate editorial versions
>
> Do not perform awkward word-for-word translation.
>
> Write natural English and natural French.
>
> Preserve the same meaning, confidence, and rhythm, but allow sentence structures to differ.
>
> French copy must sound like professional French marketing communication, not translated English.
>
> Example principle:
>
> English:
> “We build the attention your business deserves.”
>
> French:
> “Nous créons l’attention que votre marque mérite.”
>
> The result should be natural, not literal at any cost.
>
> ## 5.6 Microcopy
>
> CTA language should be direct.
>
> Good directions:
>
> - Let’s Talk
> - Start a Project
> - See the Work
> - Explore What We Do
> - Build With Us
> - Talk About Your Project
> - Parlons de votre projet
> - Démarrer un projet
>
> Avoid weak CTA wording such as “Click Here”.
>
> ---
>
> # 6. The central creative concept
>
> Build the site around a single visual metaphor rather than a collection of unrelated effects.
>
> ## Recommended concept: THE GROWTH ENGINE
>
> The website visually represents a system that takes an idea and turns it into movement.
>
> Imagine a central 3D structure that starts as a compact form and progressively becomes:
>
> - more connected
> - more energetic
> - more visible
> - more expansive
> - more complete
>
> The exact 3D model can be chosen after inspecting the brand/logo/assets, but the conceptual progression must remain.
>
> Possible visual language:
>
> - an evolving network
> - a modular machine
> - an abstract kinetic core
> - interconnected forms
> - a geometric growth system
> - particles following paths
> - multiple elements converging into a coherent structure
>
> Avoid making it a generic floating chrome sphere with no meaning.
>
> The scene should look authored for this agency.
>
> ## Core idea
>
> **The visitor scrolls through the agency's growth process.**
>
> The 3D object should not merely rotate 360 degrees on loop.
>
> The user should feel that scrolling is causing the system to evolve.
>
> ---
>
> # 7. Homepage experience and scroll choreography
>
> Build one long, cinematic homepage.
>
> The page should be composed of semantic HTML sections layered around a persistent WebGL scene.
>
> The preferred experience is not “one Canvas per section”.
>
> Use a persistent scene where possible and change the scene's state according to scroll progress.
>
> ## Section 01 - Hero: “We Grow Together.”
>
> Visual state:
>
> - full-screen 3D scene
> - central object small or partially hidden
> - restrained movement before the user interacts
> - subtle ambient particles or depth
> - typography is large and confident
>
> Headline direction:
>
> **WE GROW TOGETHER.**
>
> Supporting thought:
>
> **Focus on your business. We do the rest.**
>
> CTA:
>
> **Let’s Talk**
>
> Interaction:
>
> - cursor subtly influences scene parallax
> - scroll starts the main choreography
> - small scroll indicator can be present
> - typography should react gently as the scene moves
>
> Important:
>
> Do not clutter the hero with ten badges, buttons, statistics, and cards.
>
> Make the first viewport visually powerful.
>
> ## Section 02 - The problem / opportunity
>
> Transition from the hero into the idea of visibility.
>
> Messaging direction:
>
> **Good businesses still need to be seen.**
>
> The 3D object starts to open, rotate, or split into connected components.
>
> The idea is that a business may already have value, but marketing creates connection between that value and the audience.
>
> Use the existing agency positioning but make the copy shorter and stronger.
>
> ## Section 03 - Who We Are
>
> Use the verified agency description as the factual base.
>
> Visual:
>
> - the central 3D system becomes more structured
> - lines, nodes, modules, or particles connect
> - text appears as the user crosses scroll thresholds
>
> Content should explain:
>
> - early-stage startups to large corporations
> - multiple industries
> - A-Z marketing support
> - collaborative approach
>
> Do not write an enormous corporate “About Us” essay.
>
> ## Section 04 - Services: the system activates
>
> This should be one of the most interactive sections.
>
> Services:
>
> 1. Social Media Management
> 2. Website Design / SEO
> 3. Online Advertising
> 4. Influence Marketing
>
> Concept:
>
> Each service becomes an active component of the growth engine.
>
> Example choreography:
>
> - scroll into service section
> - main object pauses
> - service modules slide into orbit
> - active service moves closer to camera
> - service title becomes dominant
> - supporting copy appears
> - next scroll rotates scene to the next service
>
> Add small interaction details:
>
> - hover tilt
> - magnetic cursor on CTA/interactive service labels
> - subtle depth movement
> - active service indicator
>
> Do not make every card fly in from random directions.
>
> The motion should feel like one mechanical/organic system.
>
> ## Section 05 - Strategy / approach
>
> Turn the agency process into a sequence.
>
> Suggested sequence:
>
> **Understand -> Create -> Amplify -> Grow**
>
> This is not presented as a claim that was on the old website. It is a new narrative layer for presenting the existing capabilities.
>
> Each step should map logically to what the agency already does.
>
> Visual:
>
> - camera follows a path
> - the 3D system advances through four stages
> - each stage activates a different visual state
>
> The visitor should understand what working with the agency feels like.
>
> ## Section 06 - Works / portfolio
>
> This section proves that the agency is real.
>
> Use the actual local assets from:
>
> ```text
> /public/assets/web_images
> ```
>
> Current named projects:
>
> - Maison Kayser
> - Centre d'Ophtalmologie Ryad
> - Cartway
> - German Syrian Dental Clinic
> - Divine Beauty Lounge
> - Athena Contractors
>
> Each project should include:
>
> - client/project name
> - visual preview from local assets
> - short project description written only from verified project context/assets
> - “Visit Website” or equivalent link when the URL is verified
>
> Interactive direction:
>
> Make the projects feel like objects inside the 3D world.
>
> Possible implementation:
>
> - floating screens
> - planes/cards with real screenshots
> - curved project gallery
> - camera passing between projects
> - projects appearing one at a time while the scene moves
>
> Avoid a standard 3-column grid unless used as a fallback on mobile.
>
> ## Section 07 - They Trust Us
>
> Use:
>
> ```text
> /public/assets/trust_us_images
> ```
>
> The user specifically provided this directory for transparent-background trust/client images.
>
> Build a dedicated trust section that feels premium.
>
> Concept options:
>
> - logos/original transparent assets gently orbit the central object
> - client marks assemble into a constellation
> - a rotating ring of trust assets
> - assets move toward a central axis as the user scrolls
>
> Keep logos readable.
>
> Do not over-rotate or distort brand marks.
>
> This section is about confidence, not visual noise.
>
> ## Section 08 - Industry breadth
>
> The current agency content mentions work across:
>
> - doctor offices
> - government-affiliated organizations
> - private hospitals
> - pharma
> - retailers
> - restaurants
> - e-commerce
> - and more
>
> Present this as a dynamic typographic or spatial sequence instead of a boring bullet list.
>
> Example:
>
> ```text
> HEALTHCARE
> RETAIL
> PHARMA
> RESTAURANTS
> E-COMMERCE
> GOVERNMENT
> ...
> ```
>
> The terms can move through depth or form a field around the 3D core.
>
> ## Section 09 - Final CTA / contact
>
> The visual system reaches its final state.
>
> The scattered pieces from earlier sections converge into one complete form.
>
> Messaging direction:
>
> **What are we building next?**
>
> Then:
>
> **Let’s grow together.**
>
> Contact information:
>
> `contact@wedomkg.com`
>
> Do not invent a phone number or physical address.
>
> Add a strong email CTA.
>
> The final 3D state should feel calmer and more resolved than the earlier sections.
>
> ## Section 10 - Footer
>
> Minimal but polished.
>
> Include:
>
> - We Do Marketing brand
> - compact sitemap
> - language control if appropriate
> - contact email
> - copyright
> - back to top
>
> ---
>
> # 8. Visual direction
>
> Before choosing colors, inspect the existing logo and brand assets in the project.
>
> The new design should feel like an evolution of the existing identity, not a completely unrelated agency brand.
>
> Use the logo/brand assets to establish:
>
> - primary color
> - accent color
> - neutral background
> - text colors
> - surface colors
>
> Prefer a restrained palette with one strong accent.
>
> The website should feel sophisticated and editorial.
>
> Avoid “gaming website” aesthetics unless the existing brand clearly supports them.
>
> Avoid excessive neon.
>
> Avoid excessive glassmorphism.
>
> Avoid gradients on every element.
>
> Avoid putting a glow around everything.
>
> Typography should be bold and contemporary.
>
> Use one strong display font plus a highly readable body font, unless the existing project already has a good brand type system.
>
> Suggested principle:
>
> - large display typography for statements
> - medium typography for section labels
> - readable body typography for explanations
> - tiny metadata for project information
>
> The typography itself can participate in motion, but it must stay readable.
>
> ---
>
> # 9. Reference analysis: FIND Real Estate
>
> Reference website:
>
> `https://www.findrealestate.com/`
>
> Use this site as a **creative reference for narrative-driven digital experience**, not as a template to clone.
>
> What to learn from it:
>
> - the brand uses a memorable conceptual phrase
> - the copy is tightly connected to the brand idea
> - sections feel like steps in a story
> - visual choices reinforce the message
> - the site makes users feel they are moving through an experience, not just reading a brochure
>
> Do NOT copy:
>
> - layout
> - text
> - image choices
> - 3D assets
> - animations exactly
> - source code
> - branding
> - composition
>
> Translate the principle to We Do Marketing.
>
> FIND's conceptual language revolves around finding, movement, and progress. For We Do Marketing, build around growth, momentum, attention, connection, and execution.
>
> ---
>
> # 10. Instagram motion references
>
> Reference 1:
>
> `https://www.instagram.com/p/DZdOFrNDx4i`
>
> Reference 2:
>
> `https://www.instagram.com/reels/Dc9cPAtBmU9/`
>
> Treat these as visual/motion references.
>
> Study the following if the agent can access the videos:
>
> - pacing
> - camera movement
> - timing of reveals
> - scene transitions
> - relationship between scrolling and animation
> - depth
> - object choreography
> - typography movement
> - how a sequence builds anticipation
>
> If Instagram access is unavailable, do not block the build. Reproduce the underlying design principles through original motion choreography.
>
> Never recreate an Instagram piece one-for-one.
>
> ---
>
> # 11. Technical stack
>
> Use the existing project's framework/version when the project already exists. Do not unnecessarily replace a working setup.
>
> Preferred stack:
>
> ```text
> Next.js
> TypeScript
> React
> React Three Fiber
> Three.js
> @react-three/drei
> GSAP
> GSAP ScrollTrigger
> Lenis
> next-intl (or an equally clean i18n solution)
> lucide-react
> Tailwind CSS if already present
> ```
>
> Optional:
>
> - `motion` for small DOM/UI transitions where GSAP would be unnecessary
> - `postprocessing` only when the visual treatment clearly benefits from it
>
> Do not install ten animation libraries and duplicate responsibilities.
>
> Recommended division:
>
> - **React Three Fiber / Three.js:** WebGL scene and 3D objects
> - **GSAP + ScrollTrigger:** scroll choreography and timeline control
> - **Lenis:** smooth scroll synchronization
> - **React / CSS:** semantic content and ordinary UI
> - **next-intl:** English/French localization
> - **lucide-react:** UI icons, including the language/globe icon
>
> React Three Fiber should be used as the React renderer for the 3D scene.
>
> ---
>
> # 12. Recommended architecture
>
> Adapt this to the existing project rather than blindly replacing the repository structure.
>
> Suggested structure:
>
> ```text
> app/
>   [locale]/
>     layout.tsx
>     page.tsx
>     not-found.tsx
>
> components/
>   layout/
>     Header.tsx
>     LanguageSwitcher.tsx
>     Footer.tsx
>
>   scene/
>     MarketingScene.tsx
>     SceneController.tsx
>     GrowthCore.tsx
>     Particles.tsx
>     ProjectScreens.tsx
>     TrustOrbit.tsx
>     SceneLights.tsx
>
>   sections/
>     HeroSection.tsx
>     IntroSection.tsx
>     AboutSection.tsx
>     ServicesSection.tsx
>     ProcessSection.tsx
>     WorksSection.tsx
>     TrustSection.tsx
>     IndustriesSection.tsx
>     ContactSection.tsx
>
>   ui/
>     MagneticButton.tsx
>     ScrollIndicator.tsx
>     SectionLabel.tsx
>     ProjectCard.tsx
>
>   providers/
>     SmoothScrollProvider.tsx
>     I18nProvider.tsx
>
> data/
>   agency.ts
>   services.ts
>   projects.ts
>   industries.ts
>   assets.ts
>
> i18n/
>   en.json
>   fr.json
>   config.ts
>
> lib/
>   asset-utils.ts
>   gsap.ts
>   seo.ts
>
> public/
>   assets/
>     web_images/
>     trust_us_images/
> ```
>
> If the current project has a different structure, preserve the project's conventions and only improve the organization where needed.
>
> ---
>
> # 13. Client component rule
>
> Any Next.js component using browser-only APIs, React hooks, WebGL, GSAP lifecycle hooks, event listeners, or client-side interactivity must be a Client Component.
>
> Put:
>
> ```tsx
> "use client"
> ```
>
> at the top of the appropriate file.
>
> Do not turn the entire application into a Client Component just because the 3D scene is interactive.
>
> Keep the page/layout structure as server-rendered where practical and isolate client-heavy components.
>
> ---
>
> # 14. 3D scene architecture
>
> Use one primary persistent Canvas when possible.
>
> Conceptually:
>
> ```text
> <main>
>   <MarketingScene />
>   <HeroSection />
>   <IntroSection />
>   <AboutSection />
>   <ServicesSection />
>   <ProcessSection />
>   <WorksSection />
>   <TrustSection />
>   <IndustriesSection />
>   <ContactSection />
> </main>
> ```
>
> The 3D scene can be fixed/persistent while semantic page sections create the scroll length.
>
> A scroll progress controller should map the page's progress to scene states.
>
> Example conceptual state ranges:
>
> ```text
> 0.00 - 0.10  Hero
> 0.10 - 0.20  Intro
> 0.20 - 0.32  About
> 0.32 - 0.52  Services
> 0.52 - 0.62  Process
> 0.62 - 0.78  Works
> 0.78 - 0.87  Trust
> 0.87 - 0.93  Industries
> 0.93 - 1.00  Contact
> ```
>
> These values are guidelines, not hardcoded requirements.
>
> Use a single normalized progress value and derive multiple scene properties from it.
>
> This creates continuity.
>
> ---
>
> # 15. Scroll animation rules
>
> The website should feel “scrubbable”.
>
> The user scrolls down and the scene responds directly.
>
> The user scrolls back up and the scene reverses naturally.
>
> Avoid animations that only work one time.
>
> Prefer:
>
> ```text
> scroll progress -> timeline progress -> scene state
> ```
>
> rather than:
>
> ```text
> scroll event -> random animation -> stop
> ```
>
> GSAP ScrollTrigger should control complex scroll timelines.
>
> Use pinning selectively.
>
> Do not pin everything.
>
> Do not animate the pinned wrapper itself when that would create ScrollTrigger measurement problems. Animate children inside it.
>
> Keep the number of simultaneous animations reasonable.
>
> ---
>
> # 16. Smooth scrolling
>
> Integrate Lenis carefully with GSAP ScrollTrigger.
>
> The Lenis scroll position and ScrollTrigger update loop must remain synchronized.
>
> Do not create two competing smooth-scroll systems.
>
> Avoid browser-scroll hijacking behaviors that make navigation or accessibility painful.
>
> The user should still feel like they control the page.
>
> ---
>
> # 17. 3D performance rules
>
> This is a marketing website, not a game.
>
> The page must remain responsive.
>
> Mandatory optimization principles:
>
> - keep geometry counts reasonable
> - reuse materials and geometries
> - use instancing for repeated particles/objects when appropriate
> - compress textures
> - avoid loading every asset immediately
> - lazy-load heavy project visuals where possible
> - do not use giant 4K/8K textures without a reason
> - avoid hundreds of separate React components representing individual particles
> - use `useMemo` where appropriate for static scene resources
> - dispose of resources correctly where assets are dynamically created
> - avoid updating React state every animation frame when a ref can be used
> - use Three.js frame-loop efficiently
> - keep expensive calculations outside render loops
>
> The scroll timeline should update object transforms efficiently rather than causing large React re-renders.
>
> ---
>
> # 18. Responsive behavior
>
> Do not build desktop first and then simply shrink it.
>
> Design three behavior tiers:
>
> ## Desktop
>
> Full 3D experience.
>
> - large camera movements
> - depth
> - hover interactions
> - project screens
> - trust orbit
>
> ## Tablet
>
> Reduced complexity.
>
> - fewer objects
> - reduced camera travel
> - simpler hover behavior
> - preserved core scroll narrative
>
> ## Mobile
>
> Still 3D, but lighter.
>
> - fewer particles
> - smaller geometry
> - less postprocessing
> - no hover-dependent functionality
> - large tap targets
> - simplified camera movement
> - preserve the essential visual metaphor
>
> The mobile site must NOT become a completely different plain website unless performance makes it unavoidable.
>
> Use adaptive quality based on viewport/device capability where practical.
>
> ---
>
> # 19. Accessibility and reduced motion
>
> Support:
>
> ```css
> @media (prefers-reduced-motion: reduce) {
>   ...
> }
> ```
>
> For users who prefer reduced motion:
>
> - disable heavy continuous movement
> - shorten transitions
> - reduce camera movement
> - keep all content visible
> - avoid hiding essential information behind animation
>
> The website must still communicate its story without animation.
>
> Also ensure:
>
> - semantic headings
> - keyboard navigation
> - visible focus states
> - accessible buttons
> - accessible language switcher
> - sufficient text contrast
> - meaningful alt text for content images
>
> Decorative 3D elements should be `aria-hidden` where appropriate.
>
> ---
>
> # 20. Interaction details
>
> Add small interactions that make the website feel expensive.
>
> Examples:
>
> ## Cursor
>
> Optional desktop-only custom cursor/magnetism.
>
> Use it subtly.
>
> Do not create a huge animated cursor that distracts from content.
>
> ## Magnetic buttons
>
> CTA buttons can slightly follow the pointer on desktop.
>
> Use restrained movement.
>
> ## Project hover
>
> Project preview can:
>
> - tilt slightly
> - zoom a little
> - reveal metadata
> - shift depth
>
> Never rotate project previews so far that the work becomes hard to see.
>
> ## Navigation
>
> Header should remain readable over both light and dark/complex scene states.
>
> Consider a smart header treatment that reacts to background contrast.
>
> Navigation should not disappear because of the 3D scene.
>
> ---
>
> # 21. Header
>
> Recommended structure:
>
> ```text
> LOGO          ABOUT  SERVICES  WORKS  CONTACT       [globe EN/FR]
> ```
>
> Or a more minimal version:
>
> ```text
> LOGO                                  MENU  EN/FR
> ```
>
> The exact choice should follow the existing brand assets.
>
> The language switcher must remain in the upper-right region.
>
> Header behavior:
>
> - transparent/overlay mode over hero
> - transitions to a readable surface when necessary
> - smooth hide/show only if it improves UX
> - sticky/fixed behavior must not conflict with ScrollTrigger
>
> ---
>
> # 22. Portfolio data model
>
> Store portfolio data separately from UI.
>
> Example concept:
>
> ```ts
> type Project = {
>   name: string
>   href: string
>   image: string
>   description: {
>     en: string
>     fr: string
>   }
>   category?: string
> }
> ```
>
> Populate only verified URLs and available assets.
>
> Do not fabricate project details such as:
>
> - project dates
> - budgets
> - traffic growth
> - revenue increases
> - conversion rates
> - team size
> - awards
>
> unless those facts exist in trusted project data.
>
> ---
>
> # 23. Asset discovery workflow
>
> Before implementing the final gallery:
>
> 1. Recursively inspect `/public/assets/web_images`.
> 2. Recursively inspect `/public/assets/trust_us_images`.
> 3. Build a temporary asset manifest.
> 4. Match each image to the appropriate project/client from its filename or visual content.
> 5. Confirm dimensions and formats.
> 6. Use optimized local paths.
> 7. Remove duplicate usage unless there is a strong reason.
>
> If there are multiple images for one project, choose one primary image and optionally use the others inside a project interaction.
>
> For transparent-background trust assets, never put them inside opaque cards unless the design specifically benefits from it.
>
> ---
>
> # 24. SEO
>
> The site is visually experimental, but it must still be a serious business website.
>
> Every important message must exist in semantic HTML.
>
> Do not put all text inside the Canvas.
>
> Use real headings:
>
> - one primary H1
> - logical H2 sections
> - H3 service/project titles where appropriate
>
> Include:
>
> - page title
> - meta description
> - canonical URL
> - Open Graph metadata
> - Twitter/X card metadata where appropriate
> - language metadata
> - sitemap support
> - robots support
>
> Add appropriate Organization structured data using only verified information.
>
> Do not invent an address just to create LocalBusiness schema.
>
> Since the public site currently verifies the email but not a physical address, use a schema type that does not require a fabricated address.
>
> English and French versions should each have appropriate metadata.
>
> ---
>
> # 25. Internationalization implementation
>
> Recommended locale structure:
>
> ```text
> /en
> /fr
> ```
>
> Keep content in data/dictionary files.
>
> Example:
>
> ```text
> i18n/
>   en.json
>   fr.json
> ```
>
> The language switcher should:
>
> - clearly show current language
> - use a globe/language icon
> - expose EN and FR
> - preserve route/section where possible
> - update `<html lang="...">`
> - preserve accessibility labels
>
> Avoid duplicating the entire page component for each language.
>
> ---
>
> # 26. Content hierarchy
>
> Every section should answer a visitor question.
>
> ```text
> HERO
> “Who are you and why should I care?”
>
> ABOUT
> “What do you actually do?”
>
> SERVICES
> “Can you solve my marketing problem?”
>
> PROCESS
> “What is it like to work with you?”
>
> WORKS
> “Have you actually done good work?”
>
> TRUST
> “Do other organizations trust you?”
>
> INDUSTRIES
> “Can you understand businesses like mine?”
>
> CONTACT
> “How do I start?”
> ```
>
> This hierarchy is more important than adding more sections.
>
> ---
>
> # 27. Do not overdesign
>
> A premium site does not mean every element moves.
>
> Establish hierarchy:
>
> **Primary:** scroll-driven 3D narrative
>
> **Secondary:** typography transitions and image movement
>
> **Tertiary:** hover/micro-interactions
>
> Everything else should remain calm.
>
> Do not stack:
>
> - cursor effects
> - blur effects
> - noise
> - particles
> - infinite marquee
> - giant gradients
> - excessive shadows
> - 5 different transition styles
>
> all at the same time.
>
> The viewer should understand what is happening.
>
> ---
>
> # 28. Motion quality rules
>
> Motion should have:
>
> - anticipation
> - acceleration/deceleration
> - continuity
> - depth
> - clear cause/effect
>
> Avoid:
>
> - constant random rotation
> - random floating objects
> - objects teleporting between states
> - extreme elastic effects everywhere
> - scroll animation that feels delayed or disconnected from input
>
> Prefer smooth, controlled, editorial movement.
>
> ---
>
> # 29. Loading experience
>
> Because this is a 3D site, loading must be designed.
>
> Implement a minimal preloader if asset weight justifies it.
>
> The preloader should not become a long animation users have to watch.
>
> It can show:
>
> **WE DO MARKETING**
>
> and a compact loading/progress indicator.
>
> Reveal the hero only when the critical scene is ready.
>
> Lazy-load non-critical work/trust assets.
>
> If WebGL fails, show a graceful DOM-only version rather than a blank page.
>
> ---
>
> # 30. Error/fallback behavior
>
> The website should remain functional when:
>
> - WebGL is unavailable
> - reduced motion is enabled
> - a 3D asset fails to load
> - a local image is missing
> - the user has a low-powered device
>
> Provide fallback visuals and keep the content accessible.
>
> Never let the Canvas be the only source of essential information.
>
> ---
>
> # 31. Navigation behavior
>
> Navigation links should scroll to sections smoothly.
>
> IDs should be semantic, for example:
>
> ```text
> #about
> #services
> #works
> #trust
> #contact
> ```
>
> When language switching occurs, preserve the same section where practical.
>
> Example:
>
> ```text
> /en#services -> /fr#services
> ```
>
> Do not use `.html` or `.php` style links.
>
> ---
>
> # 32. Keep contact information accurate
>
> Current verified contact:
>
> ```text
> contact@wedomkg.com
> ```
>
> Use a real `mailto:` action where appropriate.
>
> Never create:
>
> ```text
> +212 5xx xxx xxx
> 123 Fake Street
> Rabat, Morocco
> hello@wedomkg.com
> @wedomarketing
> ```
>
> unless the project/source files explicitly verify those values.
>
> Accuracy matters more than filling every footer field.
>
> ---
>
> # 33. Agency portfolio URLs
>
> Use these verified portfolio links when creating the project CTAs:
>
> ```text
> Maison Kayser
> https://www.maison-kayser.ma/
>
> Centre d'Ophtalmologie Ryad
> https://www.ophtalmoryad.ma/
>
> Cartway
> https://www.cartway.ma/
>
> German Syrian Dental Clinic
> https://www.gsdentalclinic.ma/
>
> Divine Beauty Lounge
> https://www.dvinebeautelounge.com/
>
> Athena Contractors
> https://athena-contractors.com/
> ```
>
> Use `target="_blank"` and an appropriate `rel` attribute for external links when that matches the project's conventions.
>
> ---
>
> # 34. Suggested page copy direction
>
> These are creative directions, not hardcoded final copy. The agent should refine them to match the final design.
>
> ## Hero
>
> **WE GROW TOGETHER.**
>
> Supporting line:
>
> **You focus on the business. We build the attention around it.**
>
> CTA:
>
> **Let’s Talk**
>
> ## About
>
> Possible direction:
>
> **Marketing should move something.**
>
> Then explain that the agency works with startups and larger organizations across a broad range of industries and provides connected marketing services from web and SEO to social, advertising, video, influence, and consulting.
>
> ## Services intro
>
> **One goal. More momentum.**
>
> Supporting text should explain that the services work together rather than operating as isolated deliverables.
>
> ## Works intro
>
> **Ideas are easy to talk about. We prefer showing the work.**
>
> ## Trust intro
>
> **They trust us with the brands they built.**
>
> ## Final CTA
>
> **Have something worth growing?**
>
> **Let’s build it.**
>
> These lines are starting points. Adapt them to the visual composition and avoid repetitive headline patterns.
>
> ---
>
> # 35. Important distinction: brand copy vs. invented claims
>
> The AI agent is allowed to create:
>
> - new headlines
> - better transitions
> - stronger section descriptions
> - editorial microcopy
> - French equivalents
> - conceptual explanations
>
> The AI agent is NOT allowed to invent:
>
> - client performance statistics
> - revenue results
> - percentages
> - years of experience
> - number of campaigns
> - number of clients
> - awards
> - geographic offices
> - phone numbers
> - physical addresses
> - testimonials
> - employees
> - certifications
> - fake case-study details
>
> unless such information is explicitly available and verified in project/source data.
>
> ---
>
> # 36. Implementation phases
>
> Build in this order.
>
> ## Phase 1 - Audit
>
> Inspect:
>
> - existing repository
> - current Next.js setup
> - package.json
> - Tailwind configuration if present
> - fonts
> - logo
> - all `/public/assets`
> - existing routing
> - existing environment variables
>
> Do not destroy useful existing infrastructure without a reason.
>
> ## Phase 2 - Content model
>
> Create:
>
> - agency data
> - service data
> - project data
> - industry data
> - English dictionary
> - French dictionary
> - asset manifest
>
> ## Phase 3 - Base design system
>
> Establish:
>
> - typography
> - spacing
> - colors
> - buttons
> - layout grid
> - header
> - section labels
> - page background
>
> ## Phase 4 - 3D core
>
> Build the central 3D object/system first.
>
> Test:
>
> - render performance
> - camera behavior
> - resize behavior
> - mobile behavior
> - reduced motion
>
> ## Phase 5 - Scroll choreography
>
> Integrate:
>
> - Lenis
> - GSAP
> - ScrollTrigger
> - scene progress
>
> ## Phase 6 - Sections
>
> Implement each semantic section around the scene.
>
> ## Phase 7 - Portfolio and trust assets
>
> Integrate real local images.
>
> ## Phase 8 - i18n
>
> Implement EN/FR and the top-right language selector.
>
> ## Phase 9 - polish
>
> Tune:
>
> - animation timing
> - easing
> - responsive behavior
> - typography
> - asset quality
> - loading
> - accessibility
> - SEO
>
> ## Phase 10 - validation
>
> Test the complete scroll journey from top to bottom repeatedly.
>
> ---
>
> # 37. Quality gate before declaring the project complete
>
> Do NOT consider the project finished until all of these are true.
>
> ### Brand
>
> - We Do Marketing identity is recognizable.
> - The content is factually grounded in the verified agency data.
> - The new design feels like a premium evolution, not an unrelated company.
>
> ### 3D
>
> - Real Three.js/WebGL content is present.
> - Scrolling actively drives the 3D scene.
> - The 3D system changes meaningfully across the page.
> - The same conceptual visual language is present throughout.
>
> ### Interaction
>
> - Scroll feels responsive.
> - Reverse scrolling works naturally.
> - Navigation works.
> - Buttons work.
> - Portfolio links work.
> - Language switch works.
>
> ### Content
>
> - English is complete.
> - French is complete.
> - Both versions read naturally.
> - No fake statistics.
> - No fake contact data.
> - No filler paragraphs.
>
> ### Assets
>
> - `/public/assets/web_images` is actually used.
> - `/public/assets/trust_us_images` is actually used.
> - Local assets are not replaced by random stock assets.
>
> ### Performance
>
> - Desktop is smooth.
> - Mobile remains usable.
> - Heavy assets are controlled.
> - WebGL failure has a fallback.
> - Reduced-motion mode works.
>
> ### SEO/accessibility
>
> - semantic HTML exists outside Canvas
> - headings are logical
> - alt text is present where appropriate
> - language metadata is correct
> - metadata exists for both locales
> - keyboard navigation works
>
> ---
>
> # 38. What the final site should feel like
>
> The final experience should make a visitor think:
>
> **“This agency knows how to make things move.”**
>
> It should feel:
>
> - cinematic
> - intentional
> - premium
> - modern
> - creative
> - credible
> - interactive
> - memorable
>
> It should NOT feel:
>
> - like a template
> - like a portfolio demo
> - like a gaming landing page
> - like an AI-generated website full of random effects
> - like a conventional Bootstrap agency page
> - like a clone of FIND Real Estate
>
> The 3D exists because the agency's story is about movement, connection, and growth.
>
> The scrolling exists because the visitor is meant to progress through that story.
>
> The portfolio exists because the agency needs proof.
>
> The trust section exists because proof should become confidence.
>
> The contact section exists because confidence should become action.
>
> ---
>
> # 39. Final instruction to the coding AI
>
> **Do not rush into implementation.**
>
> First inspect the repository, assets, existing brand files, and current application setup.
>
> Then create the content/data model.
>
> Then design the 3D concept.
>
> Then build the scroll system.
>
> Then integrate the sections.
>
> Then polish.
>
> Do not settle for a standard landing page with a 3D hero.
>
> The requirement is a **full scroll-driven 3D website experience** where the visual system evolves as the visitor moves through the agency story.
>
> Use the existing We Do Marketing content as the factual foundation.
>
> Use `/public/assets/web_images` for actual work visuals.
>
> Use `/public/assets/trust_us_images` for trust/client visuals.
>
> Use the existing website and verified URLs for the factual agency/project data.
>
> Use the FIND Real Estate website and the two Instagram references only as inspiration for narrative and motion quality.
>
> Create an original experience for We Do Marketing.
>
> **The final result should make the scroll itself feel like part of the marketing story.**
>
> ---
>
> # 40. Source notes for the agent
>
> Primary agency source:
>
> `https://wedomkg.com/`
>
> Reference experience:
>
> `https://www.findrealestate.com/`
>
> Motion references:
>
> `https://www.instagram.com/p/DZdOFrNDx4i`
>
> `https://www.instagram.com/reels/Dc9cPAtBmU9/`
>
> The current public We Do Marketing homepage verifies the agency description, service list, portfolio names/links, contact email, navigation labels, and existing “We Grow Together” positioning.
>
> End of guide.
