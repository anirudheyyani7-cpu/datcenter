// Auto-generated from EAI_Platform_Master_Dataset_v2.xlsx — the canonical schema for
// every EAI Platform data sheet. Mirrors the {column, db, type, required, options} shape
// used by ASSET_REGISTER_FIELDS in assetPortfolioSchema.js, extended to all 43 sheets.

// All 94 real Google data center campuses (locations/addresses real; PUE, utilization, asset counts, and financials are modeled estimates — Google does not publish per-site operational telemetry).
export const FACILITIES_FIELDS = [
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Facility Name", db: "facility_name", type: "text", required: true, options: null },
  { column: "Region", db: "region", type: "enum", required: true, options: ["APAC", "EMEA", "Americas", "North America", "Latin America", "Middle East", "Asia", "South America", "Europe"] },
  { column: "Country", db: "country", type: "text", required: false, options: null },
  { column: "Market/City", db: "city", type: "text", required: false, options: null },
  { column: "Latitude", db: "latitude", type: "number", required: true, options: null },
  { column: "Longitude", db: "longitude", type: "number", required: true, options: null },
  { column: "Ownership Type", db: "ownership_type", type: "enum", required: false, options: ["Owned", "Leased", "Colo"] },
  { column: "Facility Status", db: "facility_status", type: "enum", required: true, options: ["Optimal", "Good", "Warning", "Critical", "Maintenance"] },
  { column: "Tier Rating", db: "tier_rating", type: "enum", required: false, options: ["I", "II", "III", "IV"] },
  { column: "Total Capacity (MW)", db: "total_capacity_mw", type: "number", required: true, options: null },
  { column: "IT Capacity (MW)", db: "it_capacity_mw", type: "number", required: false, options: null },
  { column: "Current IT Load (MW)", db: "current_it_load_mw", type: "number", required: false, options: null },
  { column: "Utilization %", db: "utilization_pct", type: "number", required: false, options: null },
  { column: "Health Score (0-100)", db: "health_score", type: "number", required: false, options: null },
  { column: "PUE", db: "pue", type: "number", required: false, options: null },
  { column: "Renewable Energy %", db: "renewable_energy_pct", type: "number", required: false, options: null },
  { column: "Total Area (sqft)", db: "total_area_sqft", type: "number", required: false, options: null },
  { column: "Rack Count", db: "rack_count", type: "number", required: false, options: null },
  { column: "Occupancy %", db: "occupancy_pct", type: "number", required: false, options: null },
  { column: "Avg Temperature (C)", db: "avg_temperature_c", type: "number", required: false, options: null },
  { column: "Acquisition Value ($M)", db: "acquisition_value_m", type: "number", required: false, options: null },
  { column: "Current Valuation ($M)", db: "current_valuation_m", type: "number", required: false, options: null },
  { column: "Annual Depreciation ($M)", db: "annual_depreciation_m", type: "number", required: false, options: null },
];

// Lease/PPA/service/maintenance contracts per facility (dummy) — backs Knowledge Graph contract counts.
export const CONTRACTS_FIELDS = [
  { column: "Contract ID", db: "contract_id", type: "text", required: true, options: null },
  { column: "Vendor", db: "vendor", type: "text", required: false, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Contract Type", db: "contract_type", type: "enum", required: true, options: ["Lease", "PPA", "Service", "Maintenance"] },
  { column: "Expiry Date", db: "expiry_date", type: "date", required: false, options: null },
  { column: "Value ($)", db: "value_usd", type: "number", required: false, options: null },
];

// Campus > Building > Floor > Room > Rack tree. Full depth (down to Rack) for 9 flagship campuses; all other 85 campuses appear as a single Campus-level row.
export const REAL_ESTATE_HIERARCHY_FIELDS = [
  { column: "Node ID", db: "node_id", type: "text", required: true, options: null },
  { column: "Node Type", db: "node_type", type: "enum", required: true, options: ["Campus", "Building", "Floor", "Room", "Rack"] },
  { column: "Parent Node ID", db: "parent_node_id", type: "text", required: false, options: null },
  { column: "Node Name", db: "node_name", type: "text", required: true, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Latitude", db: "latitude", type: "number", required: false, options: null },
  { column: "Longitude", db: "longitude", type: "number", required: false, options: null },
  { column: "Total Capacity (MW)", db: "total_capacity_mw", type: "number", required: false, options: null },
  { column: "IT Capacity (MW)", db: "it_capacity_mw", type: "number", required: false, options: null },
  { column: "Utilization %", db: "utilization_pct", type: "number", required: false, options: null },
  { column: "Area (sqft)", db: "area_sqft", type: "number", required: false, options: null },
  { column: "Occupancy %", db: "occupancy_pct", type: "number", required: false, options: null },
  { column: "Avg Temperature (C)", db: "avg_temperature_c", type: "number", required: false, options: null },
  { column: "PUE", db: "pue", type: "number", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Operational", "Maintenance", "Critical", "Available", "Offline"] },
];

// Digital-twin sensor readings per rack (3 daily readings, flagship campuses) — powers the rack detail panel's live temperature/humidity/power widgets.
export const RACK_TELEMETRY_FIELDS = [
  { column: "Rack Node ID", db: "rack_node_id", type: "text", required: true, options: null },
  { column: "Reading Date", db: "reading_date", type: "date", required: true, options: null },
  { column: "Inlet Temp (C)", db: "inlet_temp_c", type: "number", required: false, options: null },
  { column: "Outlet Temp (C)", db: "outlet_temp_c", type: "number", required: false, options: null },
  { column: "Humidity %", db: "humidity_pct", type: "number", required: false, options: null },
  { column: "Power Draw (kW)", db: "power_draw_kw", type: "number", required: false, options: null },
  { column: "Power Capacity (kW)", db: "power_capacity_kw", type: "number", required: false, options: null },
  { column: "Fan Speed %", db: "fan_speed_pct", type: "number", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Operational", "Maintenance", "Critical"] },
];

// Floor-tile-level heatmap per room (8x4 grid, cold/hot aisle + CRAH modeling), flagship campuses only.
export const DIGITAL_TWIN_THERMAL_TILES_FIELDS = [
  { column: "Room Node ID", db: "room_node_id", type: "text", required: true, options: null },
  { column: "Column", db: "grid_col", type: "text", required: true, options: null },
  { column: "Row", db: "grid_row", type: "number", required: true, options: null },
  { column: "Temp (C)", db: "temp_c", type: "number", required: true, options: null },
  { column: "Zone", db: "zone", type: "enum", required: true, options: ["Cold Aisle", "Hot Aisle", "Neutral"] },
  { column: "Is CRAH Unit", db: "is_crah", type: "enum", required: false, options: ["Yes", "No"] },
  { column: "Is Hotspot", db: "is_hotspot", type: "enum", required: false, options: ["Yes", "No"] },
];

// Individual rack-mounted IT assets, flagship campuses (Asset Lifecycle + rack drilldowns).
export const IT_ASSETS_FIELDS = [
  { column: "Asset ID", db: "asset_id", type: "text", required: true, options: null },
  { column: "Asset Name", db: "asset_name", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "enum", required: true, options: ["Server", "Storage", "Network", "Power", "Cooling", "Security"] },
  { column: "Vendor", db: "vendor", type: "text", required: false, options: null },
  { column: "Model", db: "model", type: "text", required: false, options: null },
  { column: "Serial Number", db: "serial_number", type: "text", required: false, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Location Path", db: "location_path", type: "text", required: false, options: null },
  { column: "Rack Node ID", db: "rack_node_id", type: "text", required: false, options: null },
  { column: "U Position", db: "u_position", type: "text", required: false, options: null },
  { column: "Power (kW)", db: "power_kw", type: "number", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Operational", "Maintenance", "Repair", "EOL", "Ready", "Retired"] },
  { column: "Lifecycle Stage", db: "lifecycle_stage", type: "enum", required: true, options: ["Discover/Inventory", "Deployment", "In Use", "Maintenance", "Repair", "Ready for Deployment", "End of Life", "Retired"] },
  { column: "Install Date", db: "install_date", type: "date", required: false, options: null },
  { column: "Age (Years)", db: "age_years", type: "number", required: false, options: null },
  { column: "Warranty Expiry Date", db: "warranty_expiry_date", type: "date", required: false, options: null },
  { column: "EOL Date", db: "eol_date", type: "date", required: false, options: null },
  { column: "Next Milestone", db: "next_milestone", type: "text", required: false, options: null },
  { column: "Next Milestone Date", db: "next_milestone_date", type: "date", required: false, options: null },
  { column: "Risk Score (0-100)", db: "risk_score", type: "number", required: false, options: null },
];

// Procurement orders (dummy — no public supply-chain data exists for this).
export const PURCHASE_ORDERS_FIELDS = [
  { column: "PO Number", db: "po_number", type: "text", required: true, options: null },
  { column: "Vendor", db: "vendor", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Order Date", db: "order_date", type: "date", required: false, options: null },
  { column: "Expected Date", db: "expected_date", type: "date", required: false, options: null },
  { column: "Value ($)", db: "value_usd", type: "number", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Open", "In Transit", "At Warehouse", "Delivered", "Cancelled"] },
  { column: "Progress %", db: "progress_pct", type: "number", required: false, options: null },
];

// Line-item detail per Purchase Order — supports double-click drilldown from a PO to its contents.
export const PO_LINE_ITEMS_FIELDS = [
  { column: "PO Number", db: "po_number", type: "text", required: true, options: null },
  { column: "Line Item", db: "line_item", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Quantity", db: "quantity", type: "number", required: false, options: null },
  { column: "Unit Price ($)", db: "unit_price_usd", type: "number", required: false, options: null },
  { column: "Line Total ($)", db: "line_total_usd", type: "number", required: false, options: null },
];

// Vendor master + performance scoring (dummy).
export const VENDORS_FIELDS = [
  { column: "Vendor Name", db: "vendor_name", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Spend YTD ($)", db: "spend_ytd_usd", type: "number", required: false, options: null },
  { column: "On-Time Delivery %", db: "on_time_delivery_pct", type: "number", required: false, options: null },
  { column: "Quality Score (0-100)", db: "quality_score", type: "number", required: false, options: null },
  { column: "Contact Email", db: "contact_email", type: "text", required: false, options: null },
];

// In-transit/delivered shipments to flagship campuses (dummy).
export const SHIPMENTS_FIELDS = [
  { column: "Shipment ID", db: "shipment_id", type: "text", required: true, options: null },
  { column: "PO Number", db: "po_number", type: "text", required: false, options: null },
  { column: "Origin", db: "origin", type: "text", required: false, options: null },
  { column: "Destination", db: "destination", type: "text", required: false, options: null },
  { column: "Origin Lat", db: "origin_lat", type: "number", required: false, options: null },
  { column: "Origin Lng", db: "origin_lng", type: "number", required: false, options: null },
  { column: "Destination Lat", db: "destination_lat", type: "number", required: false, options: null },
  { column: "Destination Lng", db: "destination_lng", type: "number", required: false, options: null },
  { column: "ETA", db: "eta", type: "date", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["In Transit", "Delivered", "Delayed"] },
];

// Warehouse/DC inventory value tied to flagship facilities (dummy).
export const INVENTORY_BY_LOCATION_FIELDS = [
  { column: "Location", db: "location", type: "text", required: true, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: false, options: null },
  { column: "On Hand Value ($)", db: "on_hand_value_usd", type: "number", required: false, options: null },
  { column: "On Hand Qty", db: "on_hand_qty", type: "number", required: false, options: null },
  { column: "Utilization %", db: "utilization_pct", type: "number", required: false, options: null },
];

// Monthly CapEx/OpEx by category, all 94 facilities x 6 months (Jan-Jun 2025), scaled off each facility's real capacity (dummy cost figures).
export const FINOPS_COST_LINE_ITEMS_FIELDS = [
  { column: "Line Item ID", db: "line_item_id", type: "text", required: true, options: null },
  { column: "Month", db: "month", type: "date", required: true, options: null },
  { column: "Category", db: "category", type: "enum", required: true, options: ["IT Hardware", "Power & Cooling", "Facilities", "Network", "Security", "Others"] },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Budget ($)", db: "budget_usd", type: "number", required: false, options: null },
  { column: "CapEx ($)", db: "capex_usd", type: "number", required: false, options: null },
  { column: "OpEx ($)", db: "opex_usd", type: "number", required: false, options: null },
  { column: "Variance %", db: "variance_pct", type: "number", required: false, options: null },
];

// Monthly emissions/energy/water, all 94 facilities x 6 months, scaled off each facility's real carbon/renewable/PUE figures.
export const ESG_METRICS_FIELDS = [
  { column: "Metric ID", db: "metric_id", type: "text", required: true, options: null },
  { column: "Month", db: "month", type: "date", required: true, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Scope", db: "scope", type: "enum", required: false, options: ["Scope 1", "Scope 2", "Scope 3"] },
  { column: "Carbon Emissions (tCO2e)", db: "carbon_emissions_tco2e", type: "number", required: false, options: null },
  { column: "Energy Consumption (GWh)", db: "energy_consumption_gwh", type: "number", required: false, options: null },
  { column: "Water Usage (kL)", db: "water_usage_kl", type: "number", required: false, options: null },
  { column: "Renewable %", db: "renewable_pct", type: "number", required: false, options: null },
  { column: "Waste Recycled %", db: "waste_recycled_pct", type: "number", required: false, options: null },
];

// Maintenance/corrective work orders tied to real flagship IT Assets (dummy).
export const WORK_ORDERS_FIELDS = [
  { column: "WO ID", db: "wo_id", type: "text", required: true, options: null },
  { column: "Title", db: "title", type: "text", required: true, options: null },
  { column: "Type", db: "type", type: "enum", required: false, options: ["Corrective", "Preventive", "Standard"] },
  { column: "Asset ID", db: "asset_id", type: "text", required: false, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: false, options: null },
  { column: "Priority", db: "priority", type: "enum", required: true, options: ["Critical", "High", "Medium", "Low"] },
  { column: "Status", db: "status", type: "enum", required: true, options: ["In Progress", "Planned", "On Hold", "Completed", "Cancelled"] },
  { column: "Assigned To", db: "assigned_to", type: "text", required: false, options: null },
  { column: "Due Date", db: "due_date", type: "date", required: false, options: null },
  { column: "SLA %", db: "sla_pct", type: "number", required: false, options: null },
];

// Operational incidents tied to real flagship IT Assets (dummy).
export const INCIDENTS_FIELDS = [
  { column: "Incident ID", db: "incident_id", type: "text", required: true, options: null },
  { column: "Title", db: "title", type: "text", required: true, options: null },
  { column: "Severity", db: "severity", type: "enum", required: true, options: ["Critical", "High", "Medium", "Low", "Info"] },
  { column: "Facility ID", db: "facility_id", type: "text", required: false, options: null },
  { column: "Asset ID", db: "asset_id", type: "text", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Open", "Investigating", "Resolved"] },
  { column: "Detected Date", db: "detected_date", type: "date", required: false, options: null },
  { column: "Resolved Date", db: "resolved_date", type: "date", required: false, options: null },
];

// Connected enterprise systems for Integration Hub (dummy).
export const INTEGRATIONS_FIELDS = [
  { column: "Integration ID", db: "integration_id", type: "text", required: true, options: null },
  { column: "Name", db: "name", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "enum", required: true, options: ["IT Systems", "Cloud Services", "Enterprise Apps", "Data Sources", "Others"] },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Healthy", "Warning", "Critical", "Inactive"] },
  { column: "Success Rate %", db: "success_rate_pct", type: "number", required: false, options: null },
  { column: "Avg Response Time (ms)", db: "avg_response_time_ms", type: "number", required: false, options: null },
  { column: "Last Sync", db: "last_sync", type: "date", required: false, options: null },
];

// Platform users for Administration (dummy).
export const USERS_FIELDS = [
  { column: "User ID", db: "user_id", type: "text", required: true, options: null },
  { column: "Name", db: "name", type: "text", required: true, options: null },
  { column: "Email", db: "email", type: "text", required: true, options: null },
  { column: "Role", db: "role", type: "enum", required: true, options: ["Platform Admin", "Asset Manager", "Operations Manager", "Data Analyst", "Viewer"] },
  { column: "Organization", db: "organization", type: "text", required: false, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Active", "Inactive"] },
  { column: "Last Login", db: "last_login", type: "date", required: false, options: null },
];

// Ordered -> Confirmed -> In Transit -> At Warehouse -> Delivered pipeline summary for Supply Chain (dummy).
export const SUPPLY_CHAIN_FLOW_STAGES_FIELDS = [
  { column: "Stage", db: "stage", type: "enum", required: true, options: ["Ordered", "Confirmed", "In Transit", "At Warehouse", "Delivered"] },
  { column: "Count", db: "count", type: "number", required: true, options: null },
  { column: "Value ($)", db: "value_usd", type: "number", required: false, options: null },
  { column: "Delta % vs Last Month", db: "delta_pct", type: "number", required: false, options: null },
];

// Driver-level (not category-level) cost breakdown for FinOps (dummy).
export const TOP_COST_DRIVERS_FIELDS = [
  { column: "Driver", db: "driver", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: false, options: null },
  { column: "Impact ($, May)", db: "impact_usd", type: "number", required: true, options: null },
  { column: "Trend % vs Apr", db: "trend_pct", type: "number", required: false, options: null },
];

// Monthly cost-per-unit trend for FinOps (dummy).
export const UNIT_ECONOMICS_FIELDS = [
  { column: "Month", db: "month", type: "date", required: true, options: null },
  { column: "Cost / kW ($)", db: "cost_per_kw", type: "number", required: false, options: null },
  { column: "Cost / Rack ($)", db: "cost_per_rack", type: "number", required: false, options: null },
  { column: "Cost / Server ($)", db: "cost_per_server", type: "number", required: false, options: null },
  { column: "Cost / TB Storage ($)", db: "cost_per_tb", type: "number", required: false, options: null },
  { column: "PUE (Avg)", db: "pue_avg", type: "number", required: false, options: null },
];

// Overall/Environmental/Social/Governance scores, portfolio + per flagship facility (dummy).
export const ESG_SCORECARD_FIELDS = [
  { column: "Scope", db: "scope", type: "text", required: true, options: null },
  { column: "Overall (0-100)", db: "overall_score", type: "number", required: true, options: null },
  { column: "Environmental (0-100)", db: "environmental_score", type: "number", required: false, options: null },
  { column: "Social (0-100)", db: "social_score", type: "number", required: false, options: null },
  { column: "Governance (0-100)", db: "governance_score", type: "number", required: false, options: null },
];

// Sustainability initiatives and regulatory compliance status list (dummy).
export const ESG_INITIATIVES_COMPLIANCE_FIELDS = [
  { column: "Name", db: "name", type: "text", required: true, options: null },
  { column: "Type", db: "type", type: "enum", required: true, options: ["Initiative", "Compliance"] },
  { column: "Status", db: "status", type: "enum", required: true, options: ["On Track", "Completed", "In Progress", "Submitted", "Certified"] },
];

// Integration Hub data pipelines between connected systems (dummy).
export const DATA_FLOWS_FIELDS = [
  { column: "Flow Name", db: "flow_name", type: "text", required: true, options: null },
  { column: "Source", db: "source", type: "text", required: true, options: null },
  { column: "Destination", db: "destination", type: "text", required: true, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Success", "Warning", "Failed"] },
  { column: "Last Run", db: "last_run", type: "text", required: false, options: null },
];

// Internal API endpoint health for Integration Hub (dummy).
export const API_HEALTH_FIELDS = [
  { column: "API Name", db: "api_name", type: "text", required: true, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Healthy", "Degraded"] },
  { column: "Availability %", db: "availability_pct", type: "number", required: false, options: null },
  { column: "Avg Response Time (ms)", db: "avg_response_time_ms", type: "number", required: false, options: null },
];

// Per-service uptime % (last 30 days) for Integration Hub (dummy).
export const INTEGRATION_UPTIME_FIELDS = [
  { column: "Service", db: "service", type: "text", required: true, options: null },
  { column: "Uptime % (30d)", db: "uptime_pct", type: "number", required: true, options: null },
];

// Hub-and-spoke node counts for the Integration Map diagram (dummy).
export const INTEGRATION_MAP_NODES_FIELDS = [
  { column: "Node Name", db: "node_name", type: "text", required: true, options: null },
  { column: "Count", db: "count", type: "number", required: true, options: null },
  { column: "Health Status", db: "health_status", type: "enum", required: true, options: ["Healthy", "Warning", "Critical"] },
];

// Integration Hub error summary + category breakdown, one sheet distinguished by Type (dummy).
export const ERROR_ANALYSIS_FIELDS = [
  { column: "Module", db: "module", type: "text", required: true, options: null },
  { column: "Type", db: "type", type: "enum", required: true, options: ["Summary", "Category"] },
  { column: "Label", db: "label", type: "text", required: true, options: null },
  { column: "Value", db: "value", type: "number", required: true, options: null },
  { column: "Percent", db: "percent", type: "number", required: false, options: null },
];

// Unified long-format time series covering every trend chart across all EAI pages (Utilization, PUE, Lead Time, MTTR, SLA, Incidents, Transactions, User Activity, Capacity Forecast, Asset Value). One row per (module, metric, date, series).
export const TREND_SERIES_FIELDS = [
  { column: "Module", db: "module", type: "text", required: true, options: null },
  { column: "Metric", db: "metric", type: "text", required: true, options: null },
  { column: "Date", db: "date", type: "date", required: true, options: null },
  { column: "Series", db: "series", type: "text", required: true, options: null },
  { column: "Value", db: "value", type: "number", required: true, options: null },
];

// Unified feed covering Critical Alerts, Recent News, Active Alerts, Integration Activity, and Admin Recent Activity — disambiguated by Module + Type.
export const ALERTS_ACTIVITY_FEED_FIELDS = [
  { column: "Module", db: "module", type: "text", required: true, options: null },
  { column: "Type", db: "type", type: "enum", required: true, options: ["Alert", "Activity", "News"] },
  { column: "Severity", db: "severity", type: "enum", required: false, options: ["Critical", "High", "Medium", "Low", "Info"] },
  { column: "Title", db: "title", type: "text", required: true, options: null },
  { column: "Subtitle / Detail", db: "subtitle", type: "text", required: false, options: null },
  { column: "Timestamp", db: "timestamp", type: "text", required: true, options: null },
];

// Unified insights feed covering Intelligence Center, FinOps, ESG, and Reports insight panels — disambiguated by Module.
export const AI_INSIGHTS_RECOMMENDATIONS_FIELDS = [
  { column: "Module", db: "module", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Severity/Priority", db: "severity", type: "text", required: false, options: null },
  { column: "Title", db: "title", type: "text", required: true, options: null },
  { column: "Description", db: "description", type: "text", required: false, options: null },
  { column: "Impact", db: "impact", type: "text", required: false, options: null },
  { column: "Affected Assets", db: "affected_assets", type: "text", required: false, options: null },
  { column: "Date", db: "date", type: "date", required: false, options: null },
];

// Intelligence Center cost-saving recommendations with potential YTD savings (dummy).
export const COST_OPTIMIZATION_OPPORTUNITIES_FIELDS = [
  { column: "Opportunity", db: "opportunity", type: "text", required: true, options: null },
  { column: "Potential Savings YTD ($)", db: "potential_savings_usd", type: "number", required: true, options: null },
];

// 5x5 likelihood x impact risk matrix for Intelligence Center (dummy).
export const RISK_HEATMAP_FIELDS = [
  { column: "Likelihood", db: "likelihood", type: "enum", required: true, options: ["Very Low", "Low", "Medium", "High", "Very High"] },
  { column: "Impact", db: "impact", type: "enum", required: true, options: ["Very Low", "Low", "Medium", "High", "Very High"] },
  { column: "Count", db: "count", type: "number", required: true, options: null },
];

// ML-style predicted equipment failures, flagship campuses (dummy).
export const PREDICTIVE_FAILURES_FIELDS = [
  { column: "Asset", db: "asset", type: "text", required: true, options: null },
  { column: "Type", db: "type", type: "text", required: false, options: null },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Failure Probability %", db: "failure_probability_pct", type: "number", required: true, options: null },
  { column: "Est. Impact", db: "est_impact", type: "enum", required: true, options: ["Low", "Medium", "High"] },
];

// Anomaly detection counts by category, last 7 days, flagship campuses (dummy).
export const ANOMALIES_FIELDS = [
  { column: "Category", db: "category", type: "enum", required: true, options: ["Power Anomalies", "Temperature Anomalies", "Network Anomalies", "Configuration Drifts"] },
  { column: "Facility ID", db: "facility_id", type: "text", required: true, options: null },
  { column: "Count (7d)", db: "count_7d", type: "number", required: true, options: null },
  { column: "Delta vs Prior 7d", db: "delta", type: "number", required: false, options: null },
];

// Generated report metadata for Reports & Analytics (dummy).
export const RECENT_REPORTS_FIELDS = [
  { column: "Report Name", db: "report_name", type: "text", required: true, options: null },
  { column: "Category", db: "category", type: "text", required: false, options: null },
  { column: "Generated On", db: "generated_on", type: "text", required: true, options: null },
  { column: "Generated By", db: "generated_by", type: "text", required: false, options: null },
  { column: "Format", db: "format", type: "enum", required: true, options: ["PDF", "Excel"] },
];

// Recurring report schedules for Reports & Analytics (dummy).
export const SCHEDULED_REPORTS_FIELDS = [
  { column: "Name", db: "name", type: "text", required: true, options: null },
  { column: "Schedule", db: "schedule", type: "text", required: true, options: null },
  { column: "Enabled", db: "enabled", type: "enum", required: true, options: ["Yes", "No"] },
];

// Internal platform service health for Administration (dummy).
export const SYSTEM_HEALTH_SERVICES_FIELDS = [
  { column: "Service", db: "service", type: "text", required: true, options: null },
  { column: "Status", db: "status", type: "enum", required: true, options: ["Healthy", "Warning", "Critical"] },
];

// Platform infrastructure resource utilization for Administration (dummy).
export const SYSTEM_RESOURCE_USAGE_FIELDS = [
  { column: "Resource", db: "resource", type: "enum", required: true, options: ["CPU Usage", "Memory Usage", "Storage Usage", "Network I/O"] },
  { column: "Usage %", db: "usage_pct", type: "number", required: true, options: null },
];

// Security posture metrics for Administration (dummy).
export const SECURITY_OVERVIEW_FIELDS = [
  { column: "Metric", db: "metric", type: "text", required: true, options: null },
  { column: "Value", db: "value", type: "number", required: true, options: null },
  { column: "Delta", db: "delta", type: "number", required: false, options: null },
];

// Platform audit trail for Administration (dummy).
export const AUDIT_LOGS_FIELDS = [
  { column: "Time", db: "time", type: "text", required: true, options: null },
  { column: "User", db: "user", type: "text", required: true, options: null },
  { column: "Action", db: "action", type: "text", required: true, options: null },
  { column: "Resource", db: "resource", type: "text", required: false, options: null },
  { column: "IP Address", db: "ip_address", type: "text", required: false, options: null },
];

// Platform storage breakdown by category for Administration (dummy).
export const STORAGE_OVERVIEW_FIELDS = [
  { column: "Category", db: "category", type: "enum", required: true, options: ["Documents", "Reports", "Logs", "Backups", "Others"] },
  { column: "Used (TB)", db: "used_tb", type: "number", required: true, options: null },
];

// Open support ticket counts by severity for Administration (dummy).
export const SUPPORT_TICKETS_FIELDS = [
  { column: "Severity", db: "severity", type: "enum", required: true, options: ["Critical", "High", "Medium", "Low"] },
  { column: "Count", db: "count", type: "number", required: true, options: null },
  { column: "Delta vs Last Week", db: "delta", type: "number", required: false, options: null },
];

// Software license allocation for Administration (dummy).
export const LICENSES_USAGE_FIELDS = [
  { column: "Metric", db: "metric", type: "text", required: true, options: null },
  { column: "Value", db: "value", type: "text", required: true, options: null },
];

// Master registry: sheet name (as it appears in the workbook) -> field schema.
// Used by the upload/normalize pipeline to iterate every sheet in one pass.
export const EAI_MASTER_SCHEMA = {
  "Facilities": { table: "eai_facilities", fields: FACILITIES_FIELDS },
  "Contracts": { table: "eai_contracts", fields: CONTRACTS_FIELDS },
  "Real Estate Hierarchy": { table: "eai_real_estate_hierarchy", fields: REAL_ESTATE_HIERARCHY_FIELDS },
  "Rack Telemetry": { table: "eai_rack_telemetry", fields: RACK_TELEMETRY_FIELDS },
  "Digital Twin Thermal Tiles": { table: "eai_digital_twin_thermal_tiles", fields: DIGITAL_TWIN_THERMAL_TILES_FIELDS },
  "IT Assets": { table: "eai_it_assets", fields: IT_ASSETS_FIELDS },
  "Purchase Orders": { table: "eai_purchase_orders", fields: PURCHASE_ORDERS_FIELDS },
  "PO Line Items": { table: "eai_po_line_items", fields: PO_LINE_ITEMS_FIELDS },
  "Vendors": { table: "eai_vendors", fields: VENDORS_FIELDS },
  "Shipments": { table: "eai_shipments", fields: SHIPMENTS_FIELDS },
  "Inventory by Location": { table: "eai_inventory_by_location", fields: INVENTORY_BY_LOCATION_FIELDS },
  "FinOps Cost Line Items": { table: "eai_finops_cost_line_items", fields: FINOPS_COST_LINE_ITEMS_FIELDS },
  "ESG Metrics": { table: "eai_esg_metrics", fields: ESG_METRICS_FIELDS },
  "Work Orders": { table: "eai_work_orders", fields: WORK_ORDERS_FIELDS },
  "Incidents": { table: "eai_incidents", fields: INCIDENTS_FIELDS },
  "Integrations": { table: "eai_integrations", fields: INTEGRATIONS_FIELDS },
  "Users": { table: "eai_users", fields: USERS_FIELDS },
  "Supply Chain Flow Stages": { table: "eai_supply_chain_flow_stages", fields: SUPPLY_CHAIN_FLOW_STAGES_FIELDS },
  "Top Cost Drivers": { table: "eai_top_cost_drivers", fields: TOP_COST_DRIVERS_FIELDS },
  "Unit Economics": { table: "eai_unit_economics", fields: UNIT_ECONOMICS_FIELDS },
  "ESG Scorecard": { table: "eai_esg_scorecard", fields: ESG_SCORECARD_FIELDS },
  "ESG Initiatives & Compliance": { table: "eai_esg_initiatives_compliance", fields: ESG_INITIATIVES_COMPLIANCE_FIELDS },
  "Data Flows": { table: "eai_data_flows", fields: DATA_FLOWS_FIELDS },
  "API Health": { table: "eai_api_health", fields: API_HEALTH_FIELDS },
  "Integration Uptime": { table: "eai_integration_uptime", fields: INTEGRATION_UPTIME_FIELDS },
  "Integration Map Nodes": { table: "eai_integration_map_nodes", fields: INTEGRATION_MAP_NODES_FIELDS },
  "Error Analysis": { table: "eai_error_analysis", fields: ERROR_ANALYSIS_FIELDS },
  "Trend Series": { table: "eai_trend_series", fields: TREND_SERIES_FIELDS },
  "Alerts & Activity Feed": { table: "eai_alerts_activity_feed", fields: ALERTS_ACTIVITY_FEED_FIELDS },
  "AI Insights & Recommendations": { table: "eai_ai_insights_recommendations", fields: AI_INSIGHTS_RECOMMENDATIONS_FIELDS },
  "Cost Optimization Opportunities": { table: "eai_cost_optimization_opportunities", fields: COST_OPTIMIZATION_OPPORTUNITIES_FIELDS },
  "Risk Heatmap": { table: "eai_risk_heatmap", fields: RISK_HEATMAP_FIELDS },
  "Predictive Failures": { table: "eai_predictive_failures", fields: PREDICTIVE_FAILURES_FIELDS },
  "Anomalies": { table: "eai_anomalies", fields: ANOMALIES_FIELDS },
  "Recent Reports": { table: "eai_recent_reports", fields: RECENT_REPORTS_FIELDS },
  "Scheduled Reports": { table: "eai_scheduled_reports", fields: SCHEDULED_REPORTS_FIELDS },
  "System Health Services": { table: "eai_system_health_services", fields: SYSTEM_HEALTH_SERVICES_FIELDS },
  "System Resource Usage": { table: "eai_system_resource_usage", fields: SYSTEM_RESOURCE_USAGE_FIELDS },
  "Security Overview": { table: "eai_security_overview", fields: SECURITY_OVERVIEW_FIELDS },
  "Audit Logs": { table: "eai_audit_logs", fields: AUDIT_LOGS_FIELDS },
  "Storage Overview": { table: "eai_storage_overview", fields: STORAGE_OVERVIEW_FIELDS },
  "Support Tickets": { table: "eai_support_tickets", fields: SUPPORT_TICKETS_FIELDS },
  "Licenses & Usage": { table: "eai_licenses_usage", fields: LICENSES_USAGE_FIELDS },
};

// Loose dependency order for upload/seed sequencing (soft references only — no DB-level
// FK constraints — so partial or messy uploads don't hard-fail; app-layer joins handle gaps).
export const EAI_LOAD_ORDER = [
  "Facilities",
  "Vendors",
  "Contracts",
  "Real Estate Hierarchy",
  "Rack Telemetry",
  "Digital Twin Thermal Tiles",
  "IT Assets",
  "Purchase Orders",
  "PO Line Items",
  "Shipments",
  "Inventory by Location",
  "Supply Chain Flow Stages",
  "FinOps Cost Line Items",
  "Top Cost Drivers",
  "Unit Economics",
  "ESG Metrics",
  "ESG Scorecard",
  "ESG Initiatives & Compliance",
  "Work Orders",
  "Incidents",
  "Integrations",
  "Data Flows",
  "API Health",
  "Integration Uptime",
  "Integration Map Nodes",
  "Error Analysis",
  "Trend Series",
  "Alerts & Activity Feed",
  "AI Insights & Recommendations",
  "Cost Optimization Opportunities",
  "Risk Heatmap",
  "Predictive Failures",
  "Anomalies",
  "Recent Reports",
  "Scheduled Reports",
  "System Health Services",
  "System Resource Usage",
  "Security Overview",
  "Audit Logs",
  "Storage Overview",
  "Support Tickets",
  "Licenses & Usage",
  "Users",
];
