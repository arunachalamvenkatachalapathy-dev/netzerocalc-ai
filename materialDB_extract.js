const materialDB = [
  {
    "id": 1,
    "keywords": [
      "diesel",
      "generator",
      "sets"
    ],
    "process": "Diesel Generator (DG Sets)",
    "ef": 2.656,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "Liters"
  },
  {
    "id": 2,
    "keywords": [
      "furnace",
      "oil",
      "boilers"
    ],
    "process": "Furnace Oil (Boilers)",
    "ef": 3.119,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "Liters"
  },
  {
    "id": 3,
    "keywords": [
      "natural",
      "gas"
    ],
    "process": "Natural Gas",
    "ef": 1.891,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "scm"
  },
  {
    "id": 4,
    "keywords": [
      "indian",
      "coal",
      "boilers"
    ],
    "process": "Indian Coal (Boilers)",
    "ef": 1.992,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 5,
    "keywords": [
      "commercial",
      "lpg"
    ],
    "process": "Commercial LPG",
    "ef": 2.998,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 6,
    "keywords": [
      "petrol",
      "company",
      "cars"
    ],
    "process": "Petrol Company Cars",
    "ef": 2.284,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "Liters"
  },
  {
    "id": 7,
    "keywords": [
      "diesel",
      "company",
      "vehicles"
    ],
    "process": "Diesel Company Vehicles",
    "ef": 2.656,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "Liters"
  },
  {
    "id": 8,
    "keywords": [
      "cng",
      "vehicles"
    ],
    "process": "CNG Vehicles",
    "ef": 2.686,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 9,
    "keywords": [
      "refrigerant",
      "top"
    ],
    "process": "Refrigerant Top-up - R-32",
    "ef": 675,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 10,
    "keywords": [
      "refrigerant",
      "top",
      "410a"
    ],
    "process": "Refrigerant Top-up - R-410A",
    "ef": 2088,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 11,
    "keywords": [
      "refrigerant",
      "top"
    ],
    "process": "Refrigerant Top-up - R-22",
    "ef": 1810,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 12,
    "keywords": [
      "acetylene",
      "welding"
    ],
    "process": "Acetylene Welding",
    "ef": 3.4,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 13,
    "keywords": [
      "co2",
      "fire",
      "extinguisher",
      "discharge"
    ],
    "process": "CO2 Fire Extinguisher Discharge",
    "ef": 1,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 1",
    "unit": "kg"
  },
  {
    "id": 14,
    "keywords": [
      "office",
      "electricity",
      "grid",
      "average"
    ],
    "process": "Office Electricity - Grid Average",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2",
    "unit": "kWh"
  },
  {
    "id": 15,
    "keywords": [
      "factory",
      "electricity",
      "grid",
      "average"
    ],
    "process": "Factory Electricity - Grid Average",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2",
    "unit": "kWh"
  },
  {
    "id": 16,
    "keywords": [
      "warehouse",
      "electricity",
      "grid",
      "average"
    ],
    "process": "Warehouse Electricity - Grid Average",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2",
    "unit": "kWh"
  },
  {
    "id": 17,
    "keywords": [
      "purchased",
      "steam"
    ],
    "process": "Purchased Steam",
    "ef": 0.181,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2",
    "unit": "kg"
  },
  {
    "id": 18,
    "keywords": [
      "office",
      "electricity",
      "supplier/residual",
      "mix"
    ],
    "process": "Office Electricity - Supplier/Residual Mix",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2 TOTAL (Location-Based)",
    "unit": "kWh"
  },
  {
    "id": 19,
    "keywords": [
      "factory",
      "electricity",
      "supplier/residual",
      "mix"
    ],
    "process": "Factory Electricity - Supplier/Residual Mix",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2 TOTAL (Location-Based)",
    "unit": "kWh"
  },
  {
    "id": 20,
    "keywords": [
      "renewable/rec",
      "backed",
      "electricity",
      "purchased"
    ],
    "process": "Renewable/REC-Backed Electricity Purchased",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 2 TOTAL (Location-Based)",
    "unit": "kWh"
  },
  {
    "id": 21,
    "keywords": [
      "professional",
      "services",
      "spend"
    ],
    "process": "IT / Professional Services (Spend)",
    "ef": 0.005,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "INR"
  },
  {
    "id": 22,
    "keywords": [
      "construction",
      "repairs",
      "spend"
    ],
    "process": "Construction / Repairs (Spend)",
    "ef": 0.012,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "INR"
  },
  {
    "id": 23,
    "keywords": [
      "generic",
      "purchased",
      "services",
      "spend"
    ],
    "process": "Generic Purchased Services (Spend)",
    "ef": 0.003,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "INR"
  },
  {
    "id": 24,
    "keywords": [
      "virgin",
      "paper",
      "procurement"
    ],
    "process": "Virgin Paper Procurement",
    "ef": 0.92,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 25,
    "keywords": [
      "recycled",
      "paper",
      "procurement"
    ],
    "process": "Recycled Paper Procurement",
    "ef": 0.6,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 26,
    "keywords": [
      "plastic",
      "packaging",
      "procurement"
    ],
    "process": "Plastic Packaging Procurement",
    "ef": 2.5,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 27,
    "keywords": [
      "construction",
      "steel",
      "procurement"
    ],
    "process": "Construction Steel Procurement",
    "ef": 2.33,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 28,
    "keywords": [
      "cement",
      "procurement"
    ],
    "process": "Cement Procurement",
    "ef": 0.9,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 29,
    "keywords": [
      "laptops",
      "purchased"
    ],
    "process": "Laptops Purchased",
    "ef": 250,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units"
  },
  {
    "id": 30,
    "keywords": [
      "desktops",
      "purchased"
    ],
    "process": "Desktops Purchased",
    "ef": 350,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units"
  },
  {
    "id": 31,
    "keywords": [
      "smartphones",
      "purchased"
    ],
    "process": "Smartphones Purchased",
    "ef": 65,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units"
  },
  {
    "id": 32,
    "keywords": [
      "office",
      "furniture",
      "purchased"
    ],
    "process": "Office Furniture Purchased",
    "ef": 3.5,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 33,
    "keywords": [
      "well",
      "tank:",
      "diesel"
    ],
    "process": "Well-to-Tank: Diesel",
    "ef": 0.584,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Liters"
  },
  {
    "id": 34,
    "keywords": [
      "well",
      "tank:",
      "petrol"
    ],
    "process": "Well-to-Tank: Petrol",
    "ef": 0.463,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Liters"
  },
  {
    "id": 35,
    "keywords": [
      "grid",
      "t&d",
      "losses"
    ],
    "process": "Grid T&D Losses",
    "ef": 0.146,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kWh"
  },
  {
    "id": 36,
    "keywords": [
      "inbound",
      "lcv",
      "delivery"
    ],
    "process": "Inbound LCV Delivery",
    "ef": 0.45,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 37,
    "keywords": [
      "inbound",
      "hgv",
      "delivery"
    ],
    "process": "Inbound HGV Delivery",
    "ef": 0.85,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 38,
    "keywords": [
      "inbound",
      "rail",
      "freight"
    ],
    "process": "Inbound Rail Freight",
    "ef": 0.015,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tonne-km"
  },
  {
    "id": 39,
    "keywords": [
      "inbound",
      "air",
      "freight"
    ],
    "process": "Inbound Air Freight",
    "ef": 1.58,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tonne-km"
  },
  {
    "id": 40,
    "keywords": [
      "waste",
      "landfill"
    ],
    "process": "Waste to Landfill",
    "ef": 0.85,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 41,
    "keywords": [
      "waste",
      "recycled"
    ],
    "process": "Waste Recycled",
    "ef": 0.021,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 42,
    "keywords": [
      "waste",
      "incinerated"
    ],
    "process": "Waste Incinerated",
    "ef": 0.4,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kg"
  },
  {
    "id": 43,
    "keywords": [
      "wastewater",
      "treated"
    ],
    "process": "Wastewater Treated",
    "ef": 0.708,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "m3"
  },
  {
    "id": 44,
    "keywords": [
      "domestic",
      "flights"
    ],
    "process": "Domestic Flights",
    "ef": 0.12,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "p-km"
  },
  {
    "id": 45,
    "keywords": [
      "international",
      "flights"
    ],
    "process": "International Flights",
    "ef": 0.117,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "p-km"
  },
  {
    "id": 46,
    "keywords": [
      "rail",
      "travel"
    ],
    "process": "Rail Travel",
    "ef": 0.01,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "p-km"
  },
  {
    "id": 47,
    "keywords": [
      "taxi",
      "travel"
    ],
    "process": "Taxi Travel",
    "ef": 0.14,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 48,
    "keywords": [
      "hotel",
      "nights",
      "star"
    ],
    "process": "Hotel Nights - 5 Star",
    "ef": 75.5,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Nights"
  },
  {
    "id": 49,
    "keywords": [
      "hotel",
      "nights",
      "budget"
    ],
    "process": "Hotel Nights - Budget",
    "ef": 25,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Nights"
  },
  {
    "id": 50,
    "keywords": [
      "two",
      "wheeler",
      "commute"
    ],
    "process": "Two-Wheeler Commute",
    "ef": 0.04,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 51,
    "keywords": [
      "car",
      "commute",
      "small",
      "segment"
    ],
    "process": "Car Commute - Small Segment",
    "ef": 0.11,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 52,
    "keywords": [
      "car",
      "commute",
      "average"
    ],
    "process": "Car Commute - Average",
    "ef": 0.14,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 53,
    "keywords": [
      "car",
      "commute",
      "large",
      "segment"
    ],
    "process": "Car Commute - Large Segment",
    "ef": 0.17,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "km"
  },
  {
    "id": 54,
    "keywords": [
      "bus",
      "commute"
    ],
    "process": "Bus Commute",
    "ef": 0.03,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "p-km"
  },
  {
    "id": 55,
    "keywords": [
      "metro",
      "rail",
      "commute"
    ],
    "process": "Metro Rail Commute",
    "ef": 0.015,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "p-km"
  },
  {
    "id": 56,
    "keywords": [
      "leased",
      "office/warehouse",
      "electricity"
    ],
    "process": "Leased Office/Warehouse Electricity",
    "ef": 0.731,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "kWh"
  },
  {
    "id": 57,
    "keywords": [
      "leased",
      "facility",
      "water",
      "use"
    ],
    "process": "Leased Facility Water Use",
    "ef": 0.31,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "m3"
  },
  {
    "id": 58,
    "keywords": [
      "outbound",
      "trucking",
      "customers"
    ],
    "process": "Outbound Trucking to Customers",
    "ef": 0.09,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tonne-km"
  },
  {
    "id": 59,
    "keywords": [
      "outbound",
      "air",
      "freight",
      "customers"
    ],
    "process": "Outbound Air Freight to Customers",
    "ef": 1.58,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tonne-km"
  },
  {
    "id": 60,
    "keywords": [
      "outbound",
      "rail",
      "distribution"
    ],
    "process": "Outbound Rail Distribution",
    "ef": 0.015,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tonne-km"
  },
  {
    "id": 61,
    "keywords": [
      "third",
      "party",
      "processing",
      "intermediate",
      "goods",
      "applicable"
    ],
    "process": "Third-Party Processing of Intermediate Goods (if applicable)",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units"
  },
  {
    "id": 62,
    "keywords": [
      "estimated",
      "product",
      "use",
      "phase",
      "energy"
    ],
    "process": "Estimated Product Use-Phase Energy",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units Sold"
  },
  {
    "id": 63,
    "keywords": [
      "estimated",
      "end",
      "life",
      "emissions"
    ],
    "process": "Estimated End-of-Life Emissions",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units Sold"
  },
  {
    "id": 64,
    "keywords": [
      "assets",
      "leased",
      "others",
      "energy",
      "use"
    ],
    "process": "Assets Leased to Others - Energy Use",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Units"
  },
  {
    "id": 65,
    "keywords": [
      "franchise",
      "operations",
      "applicable"
    ],
    "process": "Franchise Operations (if applicable)",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "Franchises"
  },
  {
    "id": 66,
    "keywords": [
      "equity",
      "share",
      "weighted",
      "investee",
      "emissions"
    ],
    "process": "Equity-Share-Weighted Investee Emissions",
    "ef": 0,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "INR Invested"
  },
  {
    "id": 67,
    "keywords": [
      "financed",
      "emissions",
      "financial",
      "sector",
      "direct",
      "pass",
      "through"
    ],
    "process": "Financed Emissions (Financial Sector - direct pass-through)",
    "ef": 1,
    "ter": 1,
    "ger": 1,
    "tir": 1,
    "sim": 0.9,
    "scope": "Scope 3",
    "unit": "tCO2e Reported"
  }
];