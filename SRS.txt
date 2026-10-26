# Software Requirements Specification
# Smart Skincare Advisor

## 1. Title Page

Project Name: Smart Skincare Advisor

Document Type: Software Requirements Specification (SRS)

Version: 1.0

Date: 2026-07-27

Prepared For: Project stakeholders, developers, evaluators, and future maintainers

Prepared By: AI-assisted software analyst and technical writer

System Classification: Web-based skincare recommendation and compatibility platform

---

## 2. Revision History

| Version | Date | Description | Author |
|--------|------|-------------|--------|
| 1.0 | 2026-07-27 | Initial SRS based on the implemented system | AI-assisted analyst |

---

## 3. Table of Contents

1. Title Page
2. Revision History
3. Table of Contents
4. Introduction
5. Overall Description
6. System Features
7. External Interface Requirements
8. Non-Functional Requirements
9. Database Requirements
10. Functional Requirements
11. Non-Functional Requirements
12. User Roles and Permissions
13. Business Rules
14. Assumptions
15. Constraints
16. Future Enhancements
17. Acceptance Criteria
18. Glossary

---

## 4. Introduction

### 4.1 Purpose

This document specifies the requirements for the Smart Skincare Advisor, a web-based application that helps users discover skincare products, build personalized routines, and evaluate ingredient compatibility. The system combines a conversational consultation experience with product catalog browsing, recommendation generation, and routine safety checks.

The purpose of this SRS is to provide a complete, structured definition of the functional and non-functional requirements for the implemented system so that stakeholders, developers, and reviewers can understand the intended behavior and scope of the product.

### 4.2 Scope

The Smart Skincare Advisor enables users to:

- Create an account and log in securely.
- Maintain a personal skincare profile.
- Interact with an AI-powered skincare consultation chatbot.
- Generate personalized product recommendations based on skin type, concerns, allergies, budget, fragrance preference, and vegan preference.
- Review a suggested 4-step routine.
- Check ingredient incompatibility between selected products.
- Browse and view product details.
- Add products to a shopping cart.
- Update account settings and manage profile information.
- Use an administrative tool to update product image URLs.

The system is designed primarily for skincare consumers seeking a guided and evidence-based shopping and routine-planning experience.

### 4.3 Intended Audience

This SRS is intended for:

- Product owners and business stakeholders
- Software developers and technical designers
- QA engineers and testers
- Project managers
- Future maintainers and extension developers

### 4.4 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| UI | User Interface |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| LKR | Sri Lankan Rupees |
| AI | Artificial Intelligence |
| Gemini | Google Generative AI service used by the chatbot |
| MongoDB | NoSQL document database used by the backend |
| Mongoose | ODM library used for MongoDB integration |

### 4.5 References

The following technologies and components inform the implementation of this system:

- Express.js web framework
- MongoDB database
- Mongoose ODM
- Node.js runtime environment
- JSON Web Token authentication
- Google Gemini API for conversational AI
- HTML/CSS/JavaScript front-end interfaces

### 4.6 Document Overview

This SRS is organized to first describe the system context, then the functional features, interface requirements, data model, and quality attributes. The document concludes with role definitions, business rules, assumptions, constraints, future enhancements, acceptance criteria, and glossary.

---

## 5. Overall Description

### 5.1 Product Perspective

The Smart Skincare Advisor is a self-contained web application that combines customer-facing skincare guidance with a lightweight backend data service. The product is structured as a client-server architecture in which:

- The front end provides interactive user pages.
- The backend exposes RESTful APIs for authentication, product management, recommendation generation, compatibility checking, cart handling, and profile management.
- A MongoDB database stores users, products, routines, cart data, and compatibility-related reference data.

The product is intended to serve as an intelligent skincare planning tool rather than a full e-commerce platform. It supports product discovery, personalized recommendations, compatibility analysis, and user account management.

### 5.2 Product Functions

The system provides the following major functions:

- User registration and login
- Profile creation and profile updates
- AI-guided skincare consultation
- Personalized product recommendations
- Routine generation based on scored products
- Ingredient compatibility analysis
- Product browsing and detail review
- Cart management for logged-in users
- Account and password management
- Product image management via an administrative interface

### 5.3 User Classes and Characteristics

| User Class | Description | Typical Needs |
|------------|-------------|---------------|
| Guest User | Unauthenticated visitor | Browse public pages, view products, sign up or sign in |
| Registered Customer | Authenticated user with a personal profile | Receive recommendations, save profile preferences, manage cart, update account settings |
| Administrator / Operator | User responsible for managing product images | Update product visuals in the catalog |

### 5.4 Operating Environment

The system operates in the following environment:

- Web browser: latest versions of Chrome, Edge, Firefox, or Safari
- Server runtime: Node.js
- Backend framework: Express.js
- Database: MongoDB
- Network access: required for chatbot features using Gemini API
- Deployment model: local development or server-hosted web application

### 5.5 Design Constraints

The current implementation has the following constraints:

- The system is a web application, not a native mobile application.
- The chatbot depends on a valid Gemini API key.
- Authentication uses local browser storage for JWT tokens.
- Admin features are not protected by a dedicated role-based access control mechanism in the current implementation.
- The system does not include payment processing, order checkout, or real inventory management.

### 5.6 User Documentation

The current implementation includes the following user-facing materials:

- Web pages for login, signup, profile, routine, products, cart, compatibility checker, settings, and chatbot consultation
- In-page instructions and feedback messages
- Basic disclaimers for skincare safety and medical limitations

### 5.7 Assumptions and Dependencies

The system assumes:

- A working MongoDB instance is available.
- The environment contains necessary configuration values such as JWT secret and Gemini API key.
- The product catalog data is available in the database or seeded.
- Users have access to a modern browser and internet connectivity.

---

## 6. System Features

### 6.1 Feature 1: User Authentication and Account Management

- Feature Name: Authentication and Account Management
- Description: The system allows users to create accounts, log in, log out, and access protected features through JWT-based authentication.
- Priority: High
- Functional Requirements:
  - The system shall allow new users to register with name, email, and password.
  - The system shall validate password length and required fields.
  - The system shall prevent duplicate email registrations.
  - The system shall authenticate users using email and password.
  - The system shall return a token on successful login or signup.
  - The system shall allow authenticated users to view their profile and update account details.
- Inputs:
  - Name, email, password, current password, new password
- Processing:
  - Password hashing, token generation, validation, session state handling via local storage
- Outputs:
  - Authentication token, user object, success/error messages
- Business Rules:
  - Password must be at least six characters long.
  - Email must be unique.
  - Only authenticated users may access protected routes.
- Error Handling:
  - Invalid credentials return an authentication error.
  - Duplicate email returns a conflict response.
  - Missing required fields return a validation error.

### 6.2 Feature 2: Skincare Profile Management

- Feature Name: Skincare Profile Management
- Description: The system stores and updates a user’s skincare profile, including skin type, skincare concerns, allergies, budget, fragrance preference, and vegan preference.
- Priority: High
- Functional Requirements:
  - The system shall allow users to view their current skincare profile.
  - The system shall allow users to update profile fields.
  - The system shall use profile data for recommendations and routine generation.
- Inputs:
  - Skin type, concerns, allergies, budget, fragranceFree, veganOnly
- Processing:
  - Profile validation, persistence to MongoDB, profile reuse for recommendation engine
- Outputs:
  - Updated profile object, profile confirmation messages
- Business Rules:
  - Skin type must be one of the supported values.
  - Budget must be a numeric value when provided.
  - Allergy and concern values should be represented as lists.
- Error Handling:
  - Invalid profile values return a validation error.
  - Missing required fields return a validation message.

### 6.3 Feature 3: Product Catalog Browsing and Product Detail Viewing

- Feature Name: Product Catalog and Product Details
- Description: The system provides browsable product content for users to explore skincare products by category and view detailed information about an individual product.
- Priority: High
- Functional Requirements:
  - The system shall display products from the catalog.
  - The system shall support filtering by category.
  - The system shall allow users to view a detailed product page.
- Inputs:
  - Category filter, product identifier
- Processing:
  - Query database, return sorted products, render product cards and detail views
- Outputs:
  - Product list, product detail page, category-based navigation
- Business Rules:
  - Products belong to one of four supported categories: cleanser, treatment, moisturizer, sunscreen.
  - Product detail pages shall display key attributes such as brand, price, ingredients, and description.
- Error Handling:
  - Unknown product IDs return a not-found response.
  - Empty catalog states should display an appropriate message.

### 6.4 Feature 4: AI-Based Consultation Chatbot

- Feature Name: Conversational Consultation
- Description: The system provides an AI-powered skincare consultation chatbot that guides the user through skincare-related questions and collects conversational information for recommendation generation.
- Priority: High
- Functional Requirements:
  - The system shall allow users to send messages to the chatbot.
  - The system shall display bot responses and maintain conversation history.
  - The system shall allow users to generate a routine after sufficient conversation.
  - The system shall optionally extract a structured profile from chat history.
- Inputs:
  - User message, chat history
- Processing:
  - Interaction with Gemini API, prompt construction, response generation, profile extraction
- Outputs:
  - Chat responses, generated routine profile data
- Business Rules:
  - The chatbot must remain focused on skincare-related topics.
  - The system shall not provide medical diagnosis.
  - The extraction service shall return a valid structured profile with sensible defaults.
- Error Handling:
  - Missing Gemini API key returns a server error.
  - Unparseable extracted profile returns an informative validation error.

### 6.5 Feature 5: Personalized Recommendation and Routine Generation

- Feature Name: Recommendation Engine and Routine Builder
- Description: The system generates scored product recommendations and builds a basic 4-step routine based on the user profile and catalog data.
- Priority: High
- Functional Requirements:
  - The system shall score products using ingredient matches, skin-type compatibility, and price fit.
  - The system shall disqualify products that violate user allergies or preference constraints.
  - The system shall create a structured routine with cleanser, treatment, moisturizer, and sunscreen steps when available.
- Inputs:
  - Skin type, concerns, allergies, budget, fragranceFree, veganOnly
- Processing:
  - Score candidate products, rank them, select top product per routine step, generate compatibility notes
- Outputs:
  - Ranked recommendations, routine steps, warnings, notes
- Business Rules:
  - Allergy matches are hard disqualifiers.
  - Fragrance-free and vegan-only preferences are hard constraints.
  - The routine is based on the best available product for each category.
- Error Handling:
  - Insufficient data returns a minimal recommendation output.
  - Product scoring failures are surfaced as server errors.

### 6.6 Feature 6: Ingredient Compatibility Checking

- Feature Name: Compatibility Checker
- Description: The system analyzes selected products and identifies conflicts or positive ingredient interactions.
- Priority: High
- Functional Requirements:
  - The system shall allow users to select multiple products.
  - The system shall evaluate ingredient group conflicts and synergies.
  - The system shall return warnings and informational notes.
- Inputs:
  - Product IDs or product selections
- Processing:
  - Resolve ingredient groups, evaluate compatibility rules, sort results by severity
- Outputs:
  - Compatibility warnings, notes, safe/unsafe status
- Business Rules:
  - Conflicts are classified as avoid or caution warnings.
  - Positive interactions are categorized as essential, great, or good notes.
- Error Handling:
  - Empty or invalid product selections return validation messages.
  - Missing rules or data yield a safe fallback response.

### 6.7 Feature 7: Cart Management

- Feature Name: Shopping Cart
- Description: The system allows authenticated users to add products to a cart, update quantities, and remove items.
- Priority: Medium
- Functional Requirements:
  - The system shall create a cart for each authenticated user.
  - The system shall support adding products to the cart.
  - The system shall support updating item quantities.
  - The system shall support removing items from the cart.
- Inputs:
  - Product ID, quantity
- Processing:
  - Cart retrieval, product association, cart update persistence
- Outputs:
  - Updated cart object
- Business Rules:
  - Each user has a single cart.
  - Quantity values should be positive integers.
- Error Handling:
  - Missing product or invalid quantity returns an error response.

### 6.8 Feature 8: Admin Image Management

- Feature Name: Product Image Management
- Description: The system provides an administrative interface to update product image URLs in the database so that product visuals are reflected across the site.
- Priority: Medium
- Functional Requirements:
  - The system shall allow an administrator to search products.
  - The system shall allow an administrator to update image URLs for products.
  - The system shall persist image changes immediately.
- Inputs:
  - Product identifier, image URL
- Processing:
  - Product lookup, update operation, UI feedback
- Outputs:
  - Updated product record, visual confirmation in the admin interface
- Business Rules:
  - Image URLs are stored as strings in the product record.
  - Product images are reflected on all public pages that display product cards.
- Error Handling:
  - Invalid update requests return an error message.
  - Broken image URLs are visually indicated in the admin interface.

---

## 7. External Interface Requirements

### 7.1 User Interface

The user interface shall include the following primary web pages:

- Home page
- Products page
- Product detail page
- Consultation chatbot page
- Routine page
- Compatibility checker page
- Cart page
- Profile page
- Settings page
- Login page
- Signup page
- Admin image management page

The interface shall support responsive behavior for standard desktop and mobile screen sizes and provide clear navigation, input forms, result panels, and visual feedback.

### 7.2 Hardware Interfaces

No dedicated hardware interface is required. The system operates through standard client hardware running a browser and connected to the internet or local network.

### 7.3 Software Interfaces

The system interfaces with:

- MongoDB database through Mongoose
- Express.js server routes
- Gemini API for chatbot functionality
- Browser local storage for client-side session tokens
- Static asset delivery for images, CSS, and JavaScript files

### 7.4 Communication Interfaces

The system shall use:

- HTTP/HTTPS requests between client and server
- JSON request and response bodies
- Standard browser fetch-based API calls
- Web-based deployment over local or hosted servers

---

## 8. Non-Functional Requirements

### 8.1 Performance

- The system shall respond to standard user interactions within a reasonable time under normal load.
- Product lists and profile requests should be returned quickly for typical catalog sizes.
- The chatbot response time depends on external AI service availability and network conditions.

### 8.2 Security

- Passwords shall be stored as hashed values.
- Authentication shall use JWT-based access control for protected routes.
- Sensitive backend source files shall not be exposed through static file serving rules.
- User data shall not be exposed to unauthenticated users.

### 8.3 Reliability

- The system shall recover gracefully from invalid input and missing data.
- The system shall return structured error responses for failed requests.
- The system shall continue to serve static content even when some API features fail, subject to external service availability.

### 8.4 Availability

- The system shall be available when the server, MongoDB instance, and required API services are reachable.
- The product shall degrade gracefully when the chatbot service is unavailable.

### 8.5 Scalability

- The architecture shall support adding more products, rules, and users without architectural rework.
- The recommendation and compatibility logic shall remain modular and extendable.

### 8.6 Maintainability

- The system shall separate frontend pages, backend routes, models, and services into modular files.
- Business rules and recommendation logic shall be implemented in service modules for clarity and reuse.

### 8.7 Portability

- The application shall run on any platform that supports Node.js and a compatible browser.
- The system shall not be tightly coupled to a specific operating system.

### 8.8 Accessibility

- The interface shall provide visible labels, semantic HTML structure, and readable form controls.
- The system shall support keyboard-accessible navigation where practical.

### 8.9 Usability

- The system shall be understandable for first-time users through clear page headings, forms, and action buttons.
- The interface shall offer guidance for starting consultation, browsing products, generating routines, and checking compatibility.

---

## 9. Database Requirements

### 9.1 Entities

The system uses the following core entities:

| Entity | Purpose |
|--------|---------|
| User | Stores account credentials and skincare profile data |
| Product | Stores skincare product catalog information |
| UserProfile | Stores anonymous consultation profile snapshots |
| Cart | Stores per-user shopping cart contents |
| CompatibilityRule | Stores ingredient conflict and synergy rules |
| IngredientGroup | Stores ingredient group definitions used by compatibility logic |

### 9.2 Attributes

#### User
- id
- name
- email
- passwordHash
- skinType
- concerns
- allergies
- budget
- fragranceFree
- veganOnly
- timestamps

#### Product
- id
- name
- brand
- price
- category
- ingredients
- suitableSkinTypes
- targetsConcerns
- fragranceFree
- vegan
- description
- imageUrl
- timestamps

#### UserProfile
- id
- skinType
- concerns
- allergies
- budget
- fragranceFree
- veganOnly
- timestamps

#### Cart
- id
- user
- items
- timestamps

#### CompatibilityRule
- id
- groupA
- groupB
- severity
- reason
- recommendation

#### IngredientGroup
- id
- key
- ingredientSlugs

### 9.3 Relationships

- One User has one Cart.
- Cart contains multiple items, each referencing a Product.
- UserProfile records are associated with a recommendation consultation and do not directly link to the User account.
- CompatibilityRule and IngredientGroup define reference data used by compatibility evaluation.

### 9.4 Data Validation Rules

- Email must be unique and properly formatted.
- Password hash must exist for registered accounts.
- Product category must be one of the approved values.
- Skin type must be one of the supported values.
- Price must be numeric.
- Product ingredients and concern arrays should be stored as arrays of strings.

---

## 10. Functional Requirements

### FR-001: User Registration
The system shall allow a new user to register with a name, email, and password.

### FR-002: User Login
The system shall authenticate a user using email and password and issue a token on success.

### FR-003: Session Persistence
The system shall persist authentication state using browser storage so that logged-in users remain authenticated across page reloads.

### FR-004: Password Validation
The system shall require passwords to contain at least six characters during registration and password change operations.

### FR-005: Profile Viewing
The system shall allow authenticated users to view their stored skincare profile.

### FR-006: Profile Updating
The system shall allow authenticated users to update their skincare profile values.

### FR-007: Account Update
The system shall allow users to update their display name and email address.

### FR-008: Password Change
The system shall allow users to change their password after providing the current password.

### FR-009: Account Deletion
The system shall allow users to delete their account.

### FR-010: Product Listing
The system shall retrieve and display products from the database.

### FR-011: Product Filtering
The system shall allow filtering products by category.

### FR-012: Product Detail View
The system shall display detailed product information for an individual product.

### FR-013: Consultation Chat
The system shall allow users to chat with a skincare assistant.

### FR-014: Profile Extraction from Chat
The system shall extract structured profile information from the chat conversation when requested.

### FR-015: Recommendation Generation
The system shall generate product recommendations based on the profile data and catalog contents.

### FR-016: Routine Generation
The system shall build a basic 4-step routine using the highest-rated product for each category when available.

### FR-017: Compatibility Evaluation
The system shall evaluate ingredient compatibility for selected products.

### FR-018: Cart Add
The system shall allow authenticated users to add products to their cart.

### FR-019: Cart Update
The system shall allow users to update the quantity of items in the cart.

### FR-020: Cart Removal
The system shall allow users to remove items from the cart.

### FR-021: Admin Image Update
The system shall allow an administrator to update a product’s image URL.

### FR-022: Search in Admin Interface
The system shall allow administrators to search products by name in the admin page.

---

## 11. Non-Functional Requirements

### NFR-001: Response Time
The system shall provide page and API responses within a reasonable time for standard operations under normal usage conditions.

### NFR-002: Authentication Security
The system shall store passwords securely using hashing and shall not expose passwords in responses.

### NFR-003: Data Integrity
The system shall preserve valid user, product, and cart data and reject invalid input with clear error messages.

### NFR-004: Availability
The application shall remain accessible when the server and database are available and the external chatbot service is functioning.

### NFR-005: Maintainability
The system shall use modular backend routes, models, and services so that future enhancements can be implemented without major refactoring.

### NFR-006: Scalability
The application shall support growth in catalog size and user volume through modular service design and database-backed storage.

### NFR-007: Portability
The application shall operate across major operating systems that support Node.js and a standard browser.

### NFR-008: Accessibility
The interface shall provide readable labels, simple navigation, and usable form elements for typical users.

### NFR-009: Usability
The system shall present understandable workflows for consultation, shopping, and account management.

### NFR-010: External Dependency Resilience
The system shall respond gracefully when the Gemini API is unavailable or returns errors.

---

## 12. User Roles and Permissions

| Role | Permissions |
|------|-------------|
| Guest | View public pages, browse products, access login/signup |
| Authenticated Customer | Access profile, recommendations, routine, compatibility checker, cart, settings |
| Administrator / Operator | Update product image data through the admin page |

Note: The current implementation provides an operator-style administrative page, but it does not yet enforce a dedicated role-based permission model at the server level.

---

## 13. Business Rules

1. A user must be authenticated to access personal profile, cart, routine, and settings features.
2. A user may have only one cart.
3. Products with ingredient matches to a user’s listed allergies shall be disqualified from recommendation results.
4. Products that do not meet fragrance-free or vegan-only preferences shall not be recommended.
5. The system shall classify ingredient conflicts as warnings and positive interactions as informational notes.
6. The recommendation engine shall prioritize products that match user concerns and skin type while staying within budget.
7. The routine generator shall select one product for each routine category when available.
8. The system shall not substitute medical advice for dermatologist consultation.

---

## 14. Assumptions

- The system will be deployed in an environment with Node.js and MongoDB support.
- Product catalog data will be seeded or supplied through the database.
- Users will have access to a modern browser.
- An API key for Gemini will be available when chatbot features are used.
- The system is intended for informational and recommendation use, not for full payment or order fulfillment.

---

## 15. Constraints

- The current implementation is a web application and not a mobile-native app.
- The system depends on external AI service availability for chatbot features.
- Authentication is token-based and stored in browser local storage.
- No dedicated admin authentication or role enforcement is currently implemented.
- The system does not include checkout, payment processing, or inventory tracking.

---

## 16. Future Enhancements

The following enhancements are recommended for future versions:

- Implement full role-based access control for administrators.
- Add secure password reset functionality.
- Support persistent saved routines and shopping lists.
- Add order checkout and payment processing.
- Add analytics and tracking for recommendations and user behavior.
- Expand compatibility rule coverage with more ingredient groups.
- Add multilingual support.
- Introduce personalized notifications and reminders.
- Add customer reviews and ratings.

---

## 17. Acceptance Criteria

The system will be considered acceptable when:

1. A new user can register, log in, and access protected pages.
2. A user can update profile information and use it for recommendations.
3. The chatbot can respond to skincare-related prompts and produce a structured profile when requested.
4. The system can present product recommendations and generate a 4-step routine.
5. The compatibility checker can identify conflicts and informational notes for selected products.
6. A logged-in user can add, update, and remove items from the cart.
7. An administrator can update product image URLs using the admin page.
8. The application provides clear error feedback for invalid input and unavailable services.

---

## 18. Glossary

| Term | Meaning |
|------|---------|
| Routine | A structured skincare sequence of cleanser, treatment, moisturizer, and sunscreen |
| Recommendation | A ranked list of products that best match the user’s profile |
| Compatibility | The degree to which ingredients in selected products are safe or beneficial together |
| Consultation | A guided chatbot interaction used to collect skincare information |
| Profile | A set of user preferences and skin-related characteristics used for personalization |
| Cart | A temporary list of chosen products for a logged-in user |
| Admin | A user or operator responsible for content maintenance tasks |

---

End of Document
