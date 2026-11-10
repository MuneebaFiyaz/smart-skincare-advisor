# Software Requirements Specification

## Smart Skincare Advisor

| Document field | Value |
|---|---|
| Version | 1.1 |
| Date | 2026-11-10 |
| Status | Describes the current implemented system |
| Audience | Stakeholders, developers, testers, operators, and maintainers |

## Revision history

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-07-27 | Initial SRS |
| 1.1 | 2026-11-10 | Revised to include the implemented checkout, Stripe payment verification, order history, and authenticated administration features |

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the purpose, scope, interfaces, functional behavior, data requirements, constraints, and acceptance criteria for the Smart Skincare Advisor. It documents the complete web application as currently implemented and is intended to support development, testing, operation, and future maintenance.

### 1.2 Scope

Smart Skincare Advisor is a web-based skincare discovery and shopping application. It allows visitors to browse a product catalog, consult a skincare-focused chatbot, generate product recommendations and a four-category routine, and check ingredient compatibility. Registered customers can maintain an account and skincare profile, manage a personal cart, pay for a cart through Stripe Checkout, and review paid orders. Administrators can manage catalog products and product images, review users and carts, and promote or demote other users.

Recommendations and compatibility results are informational. The system does not diagnose skin conditions or replace professional medical advice. Stripe provides the hosted payment flow; the application does not collect or store card details.

### 1.3 Intended audience

- Product owners and project stakeholders
- Developers and system designers
- Quality assurance engineers
- System operators and administrators
- Future maintainers

### 1.4 Definitions and abbreviations

| Term | Definition |
|---|---|
| API | Application Programming Interface |
| AI | Artificial Intelligence |
| JWT | JSON Web Token used for bearer authentication |
| LKR | Sri Lankan rupee, used as the product and checkout currency |
| SRS | Software Requirements Specification |
| Stripe Checkout | Stripe-hosted payment page used to complete a purchase |
| Routine | A suggested sequence of cleanser, treatment, moisturizer, and sunscreen |

### 1.5 References

- `README.md` for local setup and Stripe test-checkout instructions
- Node.js, Express, MongoDB, and Mongoose
- Google Gemini Generative Language API
- Stripe Checkout API

## 2. Overall description

### 2.1 Product perspective

The application uses a client-server architecture. Static HTML, CSS, JavaScript, and image assets are served by an Express application. The same application exposes JSON REST endpoints. MongoDB, accessed through Mongoose, stores accounts, products, carts, orders, consultation profile snapshots, ingredient groups, and compatibility rules. Gemini supports chatbot responses and extraction of a structured profile from the conversation. Stripe hosts checkout and reports payment status to the server for verification.

### 2.2 Product functions

The system provides:

1. Public product browsing, search, filtering, and product detail pages.
2. Account signup, login, session checks, skincare profile management, account settings, password changes, and account deletion.
3. Skincare chatbot consultation and conversation-to-profile extraction.
4. Profile-based product recommendations and a generated four-category routine.
5. Ingredient compatibility analysis with conflicts and informational or positive notes.
6. Authenticated cart creation and item management.
7. Stripe-hosted checkout, server-side payment verification, paid-order persistence, and customer order history.
8. Authenticated administrator dashboard functions for catalog, user, and cart management.
9. A health endpoint for basic service availability checks.

### 2.3 User classes

| User class | Description | Main capabilities |
|---|---|---|
| Visitor | Not signed in | Browse products, use chatbot, generate recommendations, check compatibility, sign up, or log in |
| Registered customer | Signed in, non-administrator account | Manage personal profile and settings, manage cart, check out, and view personal order history |
| Administrator | Signed-in account with `isAdmin` enabled | Use administrator dashboard endpoints and create, update, upload images for, or delete products; review users and carts; manage other users' administrator status |

### 2.4 Operating environment

- Node.js server using Express
- MongoDB database
- Modern desktop or mobile web browser
- Internet access for hosted deployment and Gemini/Stripe integrations
- Gemini API key for chatbot and profile-extraction functions
- Stripe secret key for checkout and payment verification

### 2.5 Constraints and dependencies

- The application is a browser-based web application, not a native mobile application.
- MongoDB must be reachable for server startup and database-backed features.
- Chatbot and chat profile extraction depend on Gemini availability and a configured `GEMINI_API_KEY`.
- Checkout and payment verification depend on Stripe and a configured `STRIPE_SECRET_KEY`; checkout is unavailable without it.
- Stripe success and cancellation URLs use `APP_URL`, which defaults to `http://localhost:5000`.
- Authentication is bearer-token based. The browser stores the token in local storage.
- Product prices are maintained in LKR. Stripe Checkout is configured to charge in LKR.
- New accounts are not administrators by default. An operator must grant the initial administrator status outside the signup flow.
- Recommendation results and routines are generated on request; the recommendation endpoint saves an anonymized profile snapshot, not a saved routine.

## 3. System features and functional requirements

### 3.1 Account registration and authentication

- **FR-001** The system shall allow a visitor to register with a name, email address, and password.
- **FR-002** The system shall require all signup fields and require passwords to contain at least six characters.
- **FR-003** The system shall normalize email addresses and reject an already-registered address.
- **FR-004** The system shall hash passwords before storing them and shall not include password hashes in safe user responses.
- **FR-005** The system shall authenticate customers using email and password and return a signed JWT on successful signup or login.
- **FR-006** The system shall accept bearer JWTs for protected requests and reject missing, invalid, or expired tokens.
- **FR-007** The system shall provide an authenticated session-check operation that returns the current user's safe account and profile fields.
- **FR-008** The client shall persist its authentication token in browser local storage and use it for authenticated requests.

### 3.2 Customer profile and account settings

- **FR-009** An authenticated customer shall be able to retrieve and update skin type, concerns, allergies, budget, fragrance-free preference, and vegan-only preference.
- **FR-010** The system shall support the skin types dry, oily, combination, sensitive, and normal.
- **FR-011** An authenticated customer shall be able to update their name and email address. The system shall reject an email address already used by another account.
- **FR-012** An authenticated customer shall be able to change their password by providing the current password and a new password of at least six characters.
- **FR-013** An authenticated customer shall be able to delete their account.
- **FR-014** The system shall provide clear error responses for missing or invalid account and profile operations.

### 3.3 Product catalog

- **FR-015** The system shall provide public product listing and product detail operations.
- **FR-016** Product listings shall support filtering by category, suitable skin type, brand, minimum price, and maximum price, and text search across product name, brand, and ingredients.
- **FR-017** The system shall sort product listings by name.
- **FR-018** Product details shall include the product's name, brand, LKR price, category, ingredients, suitable skin types, targeted concerns, fragrance-free and vegan attributes, description, and image URL.
- **FR-019** The system shall return a not-found response for a product identifier that does not resolve to a product.
- **FR-020** Product categories shall be cleanser, treatment, moisturizer, or sunscreen.

### 3.4 Skincare consultation chatbot

- **FR-021** The system shall accept a user message and prior conversation history and return a chatbot response.
- **FR-022** The chatbot shall focus on collecting skincare preferences and ask concise questions about relevant skin type, concerns, current products, allergies or ingredients to avoid, and budget.
- **FR-023** The chatbot shall not diagnose medical conditions or provide medical advice. It shall direct users to the routine-generation flow when they request product recommendations, a routine, or product-use instructions.
- **FR-024** The system shall allow a conversation history to be submitted for structured profile extraction.
- **FR-025** Profile extraction shall return skin type, concerns, allergies, budget in LKR, fragrance-free preference, and vegan-only preference. The implementation uses defaults when the conversation does not specify these values.
- **FR-026** The system shall report missing Gemini configuration, upstream service errors, and profile-extraction errors rather than treating them as successful responses.

### 3.5 Recommendations and routine generation

- **FR-027** The system shall accept a skin profile and generate ranked product recommendations from the catalog.
- **FR-028** The system shall reject a recommendation request that lacks a skin type or numeric budget.
- **FR-029** The system shall exclude a product when a listed allergy exactly matches one of its normalized ingredient strings.
- **FR-030** The system shall exclude products that do not meet a requested fragrance-free or vegan-only preference.
- **FR-031** For eligible products, the recommendation engine shall score concern matches (60 points maximum when concerns are provided), skin-type suitability (30 points), and price fit (10 points within budget; partial credit up to 15% above budget). It shall return up to ten products with scores and explanatory reasons.
- **FR-032** The system shall save each submitted recommendation profile as a consultation profile snapshot without requiring a customer account.
- **FR-033** The system shall generate a routine using the available cleanser, treatment, moisturizer, and sunscreen recommendations and include compatibility information where available.
- **FR-034** The system shall not represent recommendations as medical advice or guaranteed outcomes.

### 3.6 Ingredient compatibility

- **FR-035** The system shall accept a non-empty array of product identifiers for compatibility checking.
- **FR-036** The system shall compare product ingredients using the configured ingredient groups and compatibility rules.
- **FR-037** The compatibility response shall distinguish conflicts from informational or positive notes and shall include a boolean safe indicator.
- **FR-038** The system shall provide read operations for the configured compatibility rules and ingredient groups.
- **FR-039** Compatibility results shall be informational and shall not claim to diagnose a skin reaction or ensure that a combination is safe for every user.

### 3.7 Shopping cart

- **FR-040** All cart operations shall require an authenticated customer.
- **FR-041** The system shall create or retrieve one cart for the current customer and return its items with product details.
- **FR-042** The system shall allow a customer to add a product, increase an existing item's quantity, set an item's quantity, and remove an item.
- **FR-043** The system shall return an error when a cart operation references an invalid product, invalid quantity, or item not present in the cart.
- **FR-044** Cart contents shall be associated with the authenticated user and shall not be shared with other customers.

### 3.8 Checkout and payment

- **FR-045** Checkout operations shall require an authenticated customer.
- **FR-046** The system shall reject checkout when Stripe is not configured, the cart is empty, or the cart contains no valid products.
- **FR-047** The system shall create a Stripe-hosted payment session using current cart product names, images, prices, and quantities, with currency LKR.
- **FR-048** The system shall direct the customer to Stripe Checkout and provide success and cancellation return URLs.
- **FR-049** After return from checkout, the client shall request server-side verification of the Stripe session. A client-side success URL alone shall not constitute confirmation of payment.
- **FR-050** The verification operation shall require a valid session identifier, confirm that the session belongs to the authenticated user, and require a completed payment session with paid payment status.
- **FR-051** After successful verification, the system shall persist a paid order with purchased item details, amount, currency, and payment time. Repeated verification of the same Stripe session shall not create a duplicate order.
- **FR-052** The system shall clear the customer's cart only when it still matches the cart identifier and item snapshot used to create that checkout session.
- **FR-053** The application shall not store or process raw payment card details.

### 3.9 Order history

- **FR-054** The order-history operation shall require authentication and return only orders belonging to the current customer.
- **FR-055** The system shall sort a customer's orders by payment time, newest first.
- **FR-056** An order shall record its Stripe checkout session identifier, paid status, purchased item names, unit amounts, quantities, currency, total amount, and paid time.

### 3.10 Administration

- **FR-057** All administrator operations shall require a valid authenticated user whose account has administrator status enabled.
- **FR-058** The administrator dashboard shall provide counts of users, administrators, products, active carts, cart value, and products grouped by category.
- **FR-059** Administrators shall be able to list users without exposing password hashes, promote or demote another user's administrator status, and delete another user's account and cart.
- **FR-060** Administrators shall be able to view carts with product and cart-owner details.
- **FR-061** Administrators shall be able to create, update, and delete catalog products.
- **FR-062** Administrators shall be able to upload and replace product images in JPG, PNG, or WebP format, up to 5 MB per upload. The system shall verify the image type and update the product image URL.
- **FR-063** The system shall prevent an administrator from changing their own administrator status or deleting their own account through the administrator user-management operations.
- **FR-064** The system shall return an authorization error to unauthenticated users and non-administrators attempting administrator operations.

### 3.11 Health check and static content

- **FR-065** The server shall serve the web application's static pages and assets.
- **FR-066** The server shall not serve backend source files or `node_modules` through its static-file handler.
- **FR-067** The system shall expose a health endpoint that reports the application process status.

## 4. External interface requirements

### 4.1 User interface

The application includes the following page families: home, product catalog, product detail, chatbot consultation, compatibility checker, routine, cart, order history, profile, account settings, login, signup, administrator dashboard, and product administration. The UI shall provide navigation, forms, result displays, and feedback suitable for desktop and mobile browsers.

### 4.2 Software interfaces

| Interface | Purpose |
|---|---|
| MongoDB via Mongoose | Persist application records |
| Gemini Generative Language API | Generate chatbot responses and extract profile data |
| Stripe Checkout API | Host payment checkout and provide payment-session status |
| Browser local storage | Persist the client-side JWT |
| Express REST API | Serve application data and operations as JSON |

### 4.3 API surface

The principal API route groups are:

| Route | Purpose |
|---|---|
| `/api/health` | Application health response |
| `/api/auth` | Signup, login, and current-session lookup |
| `/api/profile` | Customer profile, account, password, and account deletion |
| `/api/products` | Product listing, search, detail, and administrator product operations |
| `/api/recommend` | Recommendation and routine generation |
| `/api/compatibility` | Compatibility check, rules, and ingredient groups |
| `/api/chatbot` | Chat and profile extraction |
| `/api/cart` | Authenticated cart operations |
| `/api/checkout` | Stripe session creation and payment verification |
| `/api/orders` | Authenticated order history |
| `/api/admin` | Administrator dashboard, user, and cart operations |

### 4.4 Communication interfaces

The browser and server communicate using HTTP requests and JSON request/response bodies for application APIs. Product-image uploads use binary request bodies with supported image content types. Production deployments should use HTTPS. Gemini and Stripe calls require outbound network access.

## 5. Data requirements

### 5.1 Data entities

| Entity | Principal data |
|---|---|
| User | Name, unique email, password hash, skincare profile, administrator flag, timestamps |
| Product | Name, brand, LKR price, category, ingredients, suitable skin types, concerns, preferences, description, image URL, timestamps |
| UserProfile | Anonymized recommendation profile fields and timestamps |
| Cart | User reference, product references and quantities, timestamps |
| Order | User reference, unique Stripe session ID, paid status, purchased item snapshots, total and currency, paid time |
| CompatibilityRule | Ingredient-group pair, severity, explanation, recommendation |
| IngredientGroup | Group key and associated ingredient identifiers |

### 5.2 Relationships and integrity

- A cart belongs to a user and contains product references with quantities.
- An order belongs to a user and preserves item and price snapshots from the completed checkout.
- A user may have a skincare profile stored directly on the user record; separate recommendation requests also create `UserProfile` snapshots.
- Compatibility rules refer to ingredient groups and are used by the compatibility checker.
- A Stripe checkout session identifier shall uniquely identify a persisted order.
- Password hashes shall not be returned in user-facing API responses.

### 5.3 Retention and privacy

The system stores account, profile, cart, and paid-order data in MongoDB. Chat history is submitted by the browser to the chatbot endpoints and is not stored as a conversation record by the application. Recommendation profile snapshots are saved without a user name or email. The implementation does not define a retention schedule or automated data-export process.

## 6. Non-functional requirements

### 6.1 Security

- **NFR-001** Passwords shall be hashed before persistence and never returned in API responses.
- **NFR-002** Protected customer endpoints shall validate bearer JWTs; administrator endpoints shall additionally verify the user's administrator flag.
- **NFR-003** Stripe payment success shall be confirmed by retrieving and validating the session on the server, not by trusting client-provided checkout status.
- **NFR-004** Secrets for JWT signing, Gemini, and Stripe shall be supplied through server environment configuration and shall not be embedded in client assets.
- **NFR-005** Backend source files and dependency directories shall not be available through static-file serving.
- **NFR-006** Product-image uploads shall be limited to supported types and a maximum size of 5 MB.

### 6.2 Reliability and error handling

- **NFR-007** The system shall return an error response when a required dependency or operation fails rather than reporting false success.
- **NFR-008** Paid orders shall be created idempotently for repeated verification of the same Stripe session.
- **NFR-009** Cart clearing after payment shall not discard cart changes made after checkout creation.
- **NFR-010** User-facing operations shall provide actionable error feedback for invalid input, unauthorized access, missing records, and unavailable external services.

### 6.3 Performance

- **NFR-011** Standard local database and page operations should complete within a reasonable time under expected project-scale usage.
- **NFR-012** Chatbot and checkout response times depend on network and third-party service availability; the application shall report failures to the client.

### 6.4 Usability and accessibility

- **NFR-013** The UI shall use clear page headings, labels, navigation, and success/error feedback.
- **NFR-014** Primary workflows shall be usable on common desktop and mobile browser viewport sizes.
- **NFR-015** Form controls and navigation should support standard keyboard and browser interaction patterns.

### 6.5 Maintainability and portability

- **NFR-016** Frontend pages, API routes, database models, and recommendation/compatibility services shall remain separated into maintainable modules.
- **NFR-017** The application shall run on operating systems supported by Node.js and MongoDB.

## 7. Business rules

1. Product categories are cleanser, treatment, moisturizer, and sunscreen.
2. Recommendation allergy filtering uses exact normalized ingredient-string matches; the current behavior is not a medical assessment of ingredient sensitivity.
3. Allergy, fragrance-free, and vegan-only constraints are applied before recommendation scoring.
4. The routine contains at most one recommended product per category and may omit categories without eligible products.
5. Cart and order data are customer-specific.
6. Only a Stripe session confirmed as complete and paid by the server can create a paid order.
7. The system provides skincare information and product suggestions, not diagnosis or treatment advice.
8. Administrator privileges are assigned to existing accounts by an operator; public signup does not grant administrator privileges.

## 8. Assumptions

- MongoDB is available and configured when the server starts.
- Catalog products and ingredient compatibility data are seeded or otherwise present in the database.
- Gemini and Stripe credentials are configured only when those integrations are required.
- Customers use a modern browser with JavaScript enabled.
- Product prices are maintained consistently in LKR for display and checkout.
- Deployment operators configure secrets and a correct externally reachable `APP_URL` for hosted checkout.

## 9. Out of scope and current limitations

- Native iOS or Android applications.
- Medical diagnosis, clinical advice, or guarantees about product safety or effectiveness.
- Inventory reservation, shipping, fulfillment, refunds, and order cancellation workflows.
- Storing or directly handling payment-card information.
- Password reset by email, multi-factor authentication, and session revocation.
- Saved routines and persistent chatbot conversation history.
- Automated administrator onboarding or a separate administrator signup flow.
- A formal data-retention, export, or deletion policy for all associated records.
- Performance service-level guarantees or high-availability deployment.

## 10. Acceptance criteria

The system is acceptable when the following can be verified in a correctly configured environment:

1. A visitor can register, log in, and retrieve their authenticated session without exposing a password hash.
2. A customer can view and update skincare preferences, account details, and password, and can request account deletion.
3. Visitors can search/filter the catalog, open product details, use the chatbot, generate recommendations, and check product compatibility.
4. Recommendation results exclude products violating allergy or selected vegan/fragrance-free constraints, include score explanations, and produce available routine categories.
5. A customer can add, update, and remove cart items, and another customer cannot access that cart.
6. With Stripe configured, a customer can complete hosted checkout; the server verifies the completed paid session, records one paid order, and clears only the unchanged checkout cart.
7. A customer can retrieve only their own paid order history.
8. An administrator can view dashboard data, manage products and product images, and manage other users and carts; non-administrators cannot access these operations.
9. Invalid input, missing configuration, unavailable integrations, and unauthorized requests result in explicit error responses.
10. Static application pages and assets are served, while backend source and dependency directories are not exposed through the static server.

## 11. Glossary

| Term | Meaning |
|---|---|
| Administrator | Authenticated user whose account has the `isAdmin` flag enabled |
| Compatibility conflict | Configured ingredient interaction reported as a caution or avoid warning |
| Customer | Registered, authenticated non-administrator user |
| Recommendation profile snapshot | Stored set of profile fields submitted for a recommendation request |
| Safe user object | User response that omits the password hash |

---

End of Document
