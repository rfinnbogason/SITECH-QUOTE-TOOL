export const SECTIONS = [
  "WHOLE MACHINE",
  "CAB KIT COMPONENTS",
  "LICENSES & SOFTWARE",
  "MACHINE COMPONENTS",
  "SURVEY EQUIPMENT / SPS",
  "CABLES & HARNESSES",
  "MOUNTS & BRACKETS",
  "ACCESSORIES",
  "MISCELLANEOUS",
  "TRAINING & SERVICES",
] as const

export const MACHINE_MAKES = [
  "CAT", "John Deere", "Komatsu", "Volvo", "Hitachi",
  "Trimble", "Topcon", "Leica", "Other",
] as const

export const INSTALL_TYPES = [
  "TTT (Track-Type Tractor)",
  "HEX (Excavator)",
  "MG (Motor Grader)",
  "COMPACTOR",
  "SCRAPER",
  "PAVER",
  "BOX BLADE",
  "SPS/SURVEY",
  "Other",
] as const

export const CURRENCIES = ["USD", "CAD"] as const

export const COMPANY_INFO = {
  name: "SITECH Western Canada",
  fullName: "SITECH Western Canada Solutions Ltd",
  address: "10910 170 St NW South Entrance",
  city: "Edmonton, AB T5S 1H6",
  phone: "(780) 483-3700",
  email: "sitechwesterncanada@sitech-wc.ca",
  website: "www.sitech-wc.ca",
} as const

export const BUILD_GROUPS = [
  "Dozer Builds",
  "Excavator Builds",
  "Motor Grader Builds",
  "Survey Builds",
  "Recent Builds",
  "Custom",
] as const

export const TERMS_SHORT = [
  "Prices are valid for 30 days from the date of this quotation.",
  "All prices are in Canadian Dollars (CAD) unless otherwise specified.",
  "Installation and labour charges are estimates and may vary based on site conditions.",
]

export const TERMS_AND_CONDITIONS = `SITECH WESTERN CANADA SOLUTIONS LTD — TERMS AND CONDITIONS OF SALE

1. ACCEPTANCE. These Terms and Conditions of Sale ("Terms") govern all sales of products and services by SITECH Western Canada Solutions Ltd ("Seller") to the buyer ("Buyer"). By placing an order, Buyer accepts these Terms in their entirety. Any conflicting terms in Buyer's purchase order are expressly rejected unless agreed to in writing by Seller.

2. PRICES. All prices are in Canadian Dollars (CAD) unless otherwise stated. Prices are subject to change without notice. Quoted prices are valid for 30 days from the date of the quotation. Seller reserves the right to adjust prices to account for changes in manufacturer pricing, exchange rates, or other cost factors occurring after the quotation date.

3. PAYMENT TERMS. Payment is due net 30 days from invoice date unless otherwise agreed in writing. Overdue accounts are subject to interest at 2% per month (24% per annum) or the maximum rate permitted by law, whichever is less. Seller reserves the right to require payment in advance or satisfactory security prior to shipment.

4. TAXES. All applicable federal and provincial taxes, duties, and levies are the responsibility of Buyer and will be added to the invoice unless Buyer provides a valid exemption certificate prior to invoicing.

5. DELIVERY. Delivery dates are estimates only and Seller shall not be liable for delays. Risk of loss passes to Buyer upon delivery to the carrier. Seller is not responsible for damage occurring during transit. Buyer must inspect goods upon receipt and report any damage or shortage within 5 business days.

6. TITLE. Title to products passes to Buyer only upon receipt of full payment. Until full payment is received, Seller retains a security interest in all products delivered and Buyer holds such products as bailee for Seller.

7. WARRANTY. Seller passes through to Buyer any manufacturer warranties applicable to the products. SELLER MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Seller's warranty obligations are limited to those provided by the original manufacturer.

8. SOFTWARE & LICENSES. Software and subscription services are subject to the end-user license agreements ("EULA") of the respective manufacturers. Buyer accepts all EULAs upon activation. Software licenses are non-transferable unless expressly permitted by the manufacturer.

9. INSTALLATION & SERVICES. Labour estimates are based on standard conditions. Additional charges may apply for non-standard installations, site conditions, or scope changes. Seller is not responsible for damage to machine or equipment resulting from pre-existing conditions. Buyer is responsible for providing safe and accessible working conditions.

10. RETURNS. Products may not be returned without prior written authorization from Seller. Authorized returns are subject to a restocking fee of up to 25%. Special-order, software, and subscription items are non-returnable. Returned products must be in original, unused condition with original packaging.

11. LIMITATION OF LIABILITY. IN NO EVENT SHALL SELLER BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THE SALE OR USE OF PRODUCTS OR SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SELLER'S TOTAL LIABILITY SHALL NOT EXCEED THE PURCHASE PRICE OF THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM.

12. FORCE MAJEURE. Seller shall not be liable for delays or failures in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, war, strikes, pandemics, supply chain disruptions, or government actions.

13. INTELLECTUAL PROPERTY. All intellectual property rights in products and associated documentation remain with the respective manufacturers. Buyer receives only the rights expressly granted by applicable license agreements.

14. GOVERNING LAW. These Terms shall be governed by and construed in accordance with the laws of the Province of Alberta and the federal laws of Canada applicable therein. The parties submit to the exclusive jurisdiction of the courts of Alberta.

15. ENTIRE AGREEMENT. These Terms, together with the quotation and any written amendments signed by both parties, constitute the entire agreement between the parties with respect to the subject matter hereof and supersede all prior negotiations, representations, warranties, and understandings.`
