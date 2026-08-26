
    // Material keyword-to-LCI database for intelligent matching & scope classification
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

    function matchMaterial(name, unit) {
      let nameLower = (name || '').toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      for (let entry of materialDB) {
        for (let kw of entry.keywords) {
          if (nameLower.includes(kw)) {
            let score = kw.length; // longer keyword = better match
            if (score > bestScore) {
              bestScore = score;
              bestMatch = entry;
            }
          }
        }
      }

      let geo = document.getElementById('geography') ? document.getElementById('geography').value : 'IN';
      let geoDqr = (geo === 'IN') ? 1 : (geo === 'GLO' ? 2 : 3);
      
      let targetYear = document.getElementById('targetYear') ? parseInt(document.getElementById('targetYear').value) : 2024;
      let tempDqr = (Math.abs(targetYear - 2024) <= 1) ? 1 : 2;

      if (bestMatch) {
        let risk = bestMatch.sim >= 0.90 ? "LOW" : bestMatch.sim >= 0.75 ? "MEDIUM" : "HIGH";
        return {
          process: bestMatch.process,
          ef: bestMatch.ef,
          sim: bestMatch.sim, // No arbitrary floor
          ter: bestMatch.ter,
          ger: geoDqr,
          tir: tempDqr,
          risk: risk,
          scope: bestMatch.scope || "Scope 3",
          status: risk === "HIGH" ? "Manual Review" : "Auto-Matched",
          matchUnit: bestMatch.unit || "kg"
        };
      }

      // Fallback for unrecognized materials
      let fallbackEf = unit === 'kWh' ? 0.716 : unit === 'tkm' ? 0.107 : unit === 'm' ? 1.8 : 2.0;
      let fallbackScope = unit === 'kWh' ? 'Scope 2' : (unit === 'Liters' || unit === 'scm') ? 'Scope 1' : 'Scope 3';
      return {
        process: `${name} — No exact LCI match found (manual verification required)`,
        ef: fallbackEf,
        sim: 0.05, // genuinely low similarity
        ter: 4, ger: 4, tir: 3,
        risk: "HIGH",
        scope: fallbackScope,
        status: "Manual Review",
        matchUnit: unit || "kg"
      };
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    const CREDIT_RATE_INR = 2900; // ₹ per tCO₂e (Indian Carbon Market rate)

    const demoItems = [
      { id: 1, name: "Aluminum Sheet, 5052-H32", qty: 1450, unit: "kg", process: "aluminium alloy production, AlMg3 | cutoff, S - IN", ef: 14.2, sim: 0.98, ter: 1, ger: 2, tir: 1, risk: "LOW", scope: "Scope 3", status: "Auto-Matched", approved: true },
      { id: 2, name: "Custom Polyurethane Foam Insert", qty: 320, unit: "pcs", process: "polyurethane production, flexible foam | cutoff, S - GLO", ef: 4.8, sim: 0.42, ter: 4, ger: 3, tir: 2, risk: "HIGH", scope: "Scope 3", status: "Manual Review", approved: false },
      { id: 3, name: "Copper Wire, 12 AWG", qty: 50, unit: "kg", process: "copper wire drawing, technology mix | cutoff, S - IN", ef: 6.5, sim: 0.94, ter: 1, ger: 1, tir: 1, risk: "LOW", scope: "Scope 3", status: "Auto-Matched", approved: true },
      { id: 4, name: "Grid Electricity (Maharashtra Substation)", qty: 12000, unit: "kWh", process: "Electricity Grid Mix CEA India 2024", ef: 0.716, sim: 0.99, ter: 1, ger: 1, tir: 1, risk: "LOW", scope: "Scope 2", status: "Auto-Matched", approved: true },
      { id: 5, name: "Structural Steel Enclosure Bracket", qty: 850, unit: "kg", process: "steel production, converter, unalloyed | cutoff, S - IN", ef: 1.85, sim: 0.88, ter: 2, ger: 2, tir: 1, risk: "MEDIUM", scope: "Scope 3", status: "Auto-Matched", approved: false }
    ];

    let sampleBOM = [];
    let currentRiskFilter = "ALL";

    function renderTable() {
      const tbody = document.getElementById("bomTableBody");
      tbody.innerHTML = "";

      let searchVal = document.getElementById("searchInput").value.toLowerCase();
      let minScore = parseInt(document.getElementById("scoreSlider").value) / 100;

      let filtered = sampleBOM.filter(item => {
        if (currentRiskFilter !== "ALL" && item.risk !== currentRiskFilter) return false;
        if (searchVal && !item.name.toLowerCase().includes(searchVal) && !item.process.toLowerCase().includes(searchVal)) return false;
        if (item.sim < minScore) return false;
        return true;
      });

      document.getElementById("table-subtitle").innerText = sampleBOM.length === 0 ? 
        "Table is empty. Click 'Import BOM' or 'New BOM Analysis' to add items." : 
        `Loaded ${filtered.length} of ${sampleBOM.length} materials in project queue.`;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="p-8 text-center text-on-surface-variant font-medium">
              No items match the current filter criteria.
            </td>
          </tr>
        `;
      } else {
        filtered.forEach(item => {
          let valid = true;
          let qty = item.qty;
          let mu = item.matchUnit || 'kg';
          let iu = item.unit || 'kg';
          if (iu === mu) { qty = item.qty; }
          else if (iu === 'g' && mu === 'kg') qty = item.qty / 1000;
          else if (iu === 't' && mu === 'kg') qty = item.qty * 1000;
          else if (iu === 'lb' && mu === 'kg') qty = item.qty * 0.4536;
          else if (iu === 'MJ' && mu === 'kWh') qty = item.qty / 3.6;
          else valid = false;

          let co2e = valid ? ((qty * item.ef) / 1000).toFixed(3) : "ERR";
          let riskClass = item.risk === "HIGH" ? "bg-error-container text-on-error-container border-error/20" :
                          item.risk === "MEDIUM" ? "bg-amber-100 text-amber-900 border-amber-300" :
                          "bg-primary/10 text-primary border-primary/20";

          let scopeClass = item.scope === "Scope 1" ? "bg-purple-100 text-purple-900 border-purple-300" :
                           item.scope === "Scope 2" ? "bg-blue-100 text-blue-900 border-blue-300" :
                           "bg-amber-100 text-amber-900 border-amber-300";

          let tr = document.createElement("tr");
          tr.className = "hover:bg-surface-container-low transition-colors cursor-pointer";
          tr.onclick = () => toggleDrawer(item.id);

          // Build LCI Process Dropdown Options
          let optionsHtml = '';
          let matchedFound = false;
          materialDB.forEach((mat, mIdx) => {
            let selected = (mat.process === item.process) ? 'selected' : '';
            if (selected) matchedFound = true;
            optionsHtml += `<option value="${mIdx}" ${selected}>${escapeHtml(mat.process)} (${mat.ef} kgCO₂e/${escapeHtml(item.unit)})</option>`;
          });
          if (!matchedFound && item.process) {
            optionsHtml = `<option value="custom" selected>⚠️ ${escapeHtml(item.process)} (${item.ef} kgCO₂e/${escapeHtml(item.unit)})</option>` + optionsHtml;
          }

          tr.innerHTML = `
            <td class="px-4 py-3 text-outline-variant"><span id="chevron-${item.id}" class="material-symbols-outlined text-base transition-transform">chevron_right</span></td>
            <td class="px-4 py-3">
              <div class="font-semibold text-on-surface flex items-center gap-2">
                ${escapeHtml(item.name)}
                <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${scopeClass}">${item.scope || 'Scope 3'}</span>
              </div>
            </td>
            <td class="px-4 py-3 font-mono-data text-right text-on-surface-variant" onclick="event.stopPropagation()">
              ${item.approved ? 
                `<span class="font-bold text-on-surface">${item.qty.toLocaleString()} ${escapeHtml(item.unit)}</span>` : 
                `<div class="inline-flex items-center gap-1 justify-end">
                   <input type="number" min="0.001" step="any" value="${item.qty}" onchange="updateRowQty(${item.id}, this.value)" class="w-24 px-2 py-1 text-right font-bold text-xs bg-white border border-outline-variant rounded-lg outline-none focus:ring-1 focus:ring-primary font-mono-data shadow-sm" />
                   <span class="text-xs font-semibold text-on-surface-variant">${escapeHtml(item.unit)}</span>
                 </div>`
              }
            </td>
            <td class="px-4 py-3" onclick="event.stopPropagation()">
              <select onchange="changeRowLciProcess(${item.id}, this.value)" class="w-full text-xs font-medium bg-white border border-outline-variant rounded-lg p-1.5 outline-none focus:ring-1 focus:ring-primary truncate max-w-[320px]">
                ${optionsHtml}
              </select>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex gap-1 justify-center">
                <span class="dqr-pill dqr-${item.ter || 1}">${item.ter || 1}</span>
                <span class="dqr-pill dqr-${item.ger || 1}">${item.ger || 1}</span>
                <span class="dqr-pill dqr-${item.tir || 1}">${item.tir || 1}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-mono-data font-bold ${item.sim < 0.6 ? 'text-error' : 'text-primary'}">${(item.sim * 100).toFixed(0)}%</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskClass}">${item.risk}</span>
            </td>
            <td class="px-4 py-3 text-right font-mono-data font-bold text-on-surface">${co2e === "ERR" ? '<span class="text-error" title="Unit mismatch">ERR</span>' : co2e + ' t'}</td>
            <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
              <div class="flex items-center justify-end gap-1.5">
                ${item.approved ? 
                  `<span class="text-primary font-bold text-[11px] flex items-center gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Approved</span>` :
                  `<button onclick="approveRow(${item.id})" class="px-2.5 py-1 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-container">Approve</button>`
                }
                <button onclick="deleteRow(${item.id})" title="Delete this item" class="p-1 text-error/60 hover:text-error hover:bg-error-container/30 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </td>
          `;

          tbody.appendChild(tr);

          // Drawer row
          let drawerTr = document.createElement("tr");
          drawerTr.id = `drawer-${item.id}`;
          drawerTr.className = "bg-surface-container-low/40 hidden";
          drawerTr.innerHTML = `
            <td colspan="9" class="p-4 pl-12 border-b border-outline-variant/40">
              <div class="flex flex-col md:flex-row gap-6 items-start text-xs">
                <div class="w-64 shrink-0 bg-white p-3 rounded-lg border border-outline-variant">
                  <div class="font-bold text-on-surface mb-2 uppercase text-[10px] tracking-wider">Data Quality Rating (DQR)</div>
                  <div class="space-y-1.5 text-[11px]">
                    <div class="flex justify-between"><span>Technological (TeR):</span> <span class="font-bold">${item.ter || 1}/5</span></div>
                    <div class="flex justify-between"><span>Geographical (GeR):</span> <span class="font-bold">${item.ger || 1}/5</span></div>
                    <div class="flex justify-between"><span>Temporal (TiR):</span> <span class="font-bold">${item.tir || 1}/5</span></div>
                  </div>
                </div>
                <div class="flex-1 bg-white p-3 rounded-lg border border-outline-variant w-full">
                  <div class="font-bold text-on-surface mb-1">Auditor Verification & Provenance Notes</div>
                  <input type="text" value="${escapeHtml(item.auditorNotes || '')}" placeholder="Add auditor verification notes / LCI dataset provenance link..." onchange="updateRowNotes(${item.id}, this.value)" onclick="event.stopPropagation()" class="w-full text-xs p-2 border border-outline-variant rounded-lg bg-surface-container-low outline-none focus:ring-1 focus:ring-primary"/>
                </div>
              </div>
            </td>
          `;
          tbody.appendChild(drawerTr);
        });
      }

      updateKPIs();
    }

    function filterTable() { renderTable(); }

    function handleSearchInput(evt) {
      let query = (document.getElementById("searchInput").value || "").trim().toLowerCase();
      let dropdown = document.getElementById("searchDropdown");

      filterTable();

      if (!query || query.length === 0) {
        dropdown.classList.add("hidden");
        dropdown.innerHTML = "";
        return;
      }

      let matches = materialDB.filter(mat => {
        let nameMatch = mat.process.toLowerCase().includes(query);
        let kwMatch = mat.keywords.some(kw => kw.toLowerCase().includes(query));
        return nameMatch || kwMatch;
      });

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div class="p-3 text-center text-on-surface-variant font-medium">
            No LCI factors matching "${escapeHtml(query)}".
            <button onclick="openImportModal(); closeSearchDropdown();" class="block w-full mt-2 py-1 bg-primary text-white rounded font-bold text-[11px]">
              + Add Custom BOM Item
            </button>
          </div>
        `;
        dropdown.classList.remove("hidden");
        return;
      }

      let html = '';
      matches.slice(0, 8).forEach(mat => {
        let originalIdx = materialDB.indexOf(mat);
        let scopeClass = mat.scope === "Scope 1" ? "bg-purple-100 text-purple-900 border-purple-300" :
                         mat.scope === "Scope 2" ? "bg-blue-100 text-blue-900 border-blue-300" :
                         "bg-amber-100 text-amber-900 border-amber-300";

        let displayName = mat.keywords[0].toUpperCase() + ' — ' + mat.process;

        html += `
          <div onclick="addSearchItemToBom(${originalIdx})" class="p-2.5 hover:bg-primary/5 cursor-pointer flex justify-between items-center transition-colors">
            <div class="flex-1 pr-2 min-w-0">
              <div class="font-bold text-on-surface flex items-center gap-1.5 truncate">
                ${escapeHtml(displayName)}
                <span class="px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${scopeClass}">${mat.scope || 'Scope 3'}</span>
              </div>
              <div class="text-[10px] text-on-surface-variant">${mat.ef} kgCO₂e per unit • Similarity ${Math.round(mat.sim * 100)}%</div>
            </div>
            <button class="px-2 py-1 bg-primary text-white text-[10px] font-extrabold rounded hover:bg-primary-container shrink-0">
              + Add to BOM
            </button>
          </div>
        `;
      });

      dropdown.innerHTML = html;
      dropdown.classList.remove("hidden");
    }

    function addSearchItemToBom(matIdx) {
      let mat = materialDB[matIdx];
      if (!mat) return;

      let defaultUnit = mat.keywords.includes("electric") ? "kWh" :
                         (mat.keywords.includes("diesel") || mat.keywords.includes("fuel")) ? "Liters" :
                         mat.keywords.includes("transport") ? "tkm" : "kg";
      let defaultQty = defaultUnit === "kWh" ? 1000 : defaultUnit === "Liters" ? 100 : 500;
      let itemName = mat.keywords[0].charAt(0).toUpperCase() + mat.keywords[0].slice(1) + " Component";

      sampleBOM.unshift({
        id: Date.now(),
        name: itemName,
        qty: defaultQty,
        unit: defaultUnit,
        matchUnit: mat.unit || "kg",
        process: mat.process,
        ef: mat.ef,
        sim: mat.sim,
        ter: mat.ter, ger: mat.ger, tir: mat.tir,
        risk: mat.sim >= 0.90 ? "LOW" : mat.sim >= 0.75 ? "MEDIUM" : "HIGH",
        scope: mat.scope || "Scope 3",
        status: "Auto-Matched",
        approved: false
      });

      closeSearchDropdown();
      document.getElementById("searchInput").value = "";
      switchView("workbench");
      renderTable();
    }

    function closeSearchDropdown() {
      let dropdown = document.getElementById("searchDropdown");
      if (dropdown) dropdown.classList.add("hidden");
    }

    document.addEventListener("click", function(e) {
      let searchBox = document.getElementById("searchInput");
      let dropdown = document.getElementById("searchDropdown");
      if (searchBox && dropdown && !searchBox.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });

    function toggleDrawer(id) {
      let d = document.getElementById(`drawer-${id}`);
      let c = document.getElementById(`chevron-${id}`);
      if (d) {
        d.classList.toggle("hidden");
        if (c) c.style.transform = d.classList.contains("hidden") ? "rotate(0deg)" : "rotate(90deg)";
      }
    }

    function approveRow(id) {
      let item = sampleBOM.find(i => i.id === id);
      if (item) {
        item.approved = true;
        renderTable();
      }
    }

    function approveAllLowRisk() {
      sampleBOM.forEach(i => { if (i.risk === "LOW") i.approved = true; });
      renderTable();
    }

    function clearAllItems() {
      if (!confirm('Are you sure you want to clear ALL BOM items? This cannot be undone.')) return;
      sampleBOM = [];
      renderTable();
    }

    function deleteRow(id) {
      let item = sampleBOM.find(i => i.id === id);
      if (!item) return;
      if (!confirm(`Delete "${item.name}" from BOM?`)) return;
      sampleBOM = sampleBOM.filter(i => i.id !== id);
      renderTable();
    }

    function loadSampleDemo() {
      // Append demo items that aren't already in the list
      demoItems.forEach(demo => {
        let exists = sampleBOM.some(item => item.name === demo.name);
        if (!exists) {
          sampleBOM.push({...demo, id: Date.now() + demo.id});
        }
      });
      renderTable();
    }

    function setRiskFilter(risk, btn) {
      currentRiskFilter = risk;
      document.querySelectorAll(".risk-btn").forEach(b => {
        b.className = "risk-btn px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-[11px] hover:bg-surface-container-low";
      });
      btn.className = "risk-btn active px-2.5 py-1 rounded-lg border border-primary text-primary font-bold text-[11px] bg-primary/10";
      renderTable();
    }

    function updateRowQty(id, newQty) {
      let item = sampleBOM.find(i => i.id === id);
      let val = parseFloat(newQty);
      if (item && !isNaN(val) && val >= 0) {
        item.qty = val;
        renderTable();
      }
    }

    function getValidCo2(i) {
      let qty = i.qty;
      let mu = i.matchUnit || 'kg';
      let iu = i.unit || 'kg';
      if (iu === mu) { qty = i.qty; }
      else if (iu === 'g' && mu === 'kg') qty = i.qty / 1000;
      else if (iu === 't' && mu === 'kg') qty = i.qty * 1000;
      else if (iu === 'lb' && mu === 'kg') qty = i.qty * 0.4536;
      else if (iu === 'MJ' && mu === 'kWh') qty = i.qty / 3.6;
      else return 0; // Invalid conversion
      return (qty * i.ef) / 1000;
    }

    function updateKPIs() {
      let totalCo2 = sampleBOM.reduce((sum, i) => sum + getValidCo2(i), 0);
      let pending = sampleBOM.filter(i => !i.approved).length;
      let approvedCount = sampleBOM.filter(i => i.approved).length;
      let pct = sampleBOM.length > 0 ? Math.round((approvedCount / sampleBOM.length) * 100) : 0;
      let creditVal = Math.round(totalCo2 * CREDIT_RATE_INR);

      let scope1 = sampleBOM.filter(i => i.scope === "Scope 1").reduce((s, i) => s + getValidCo2(i), 0);
      let scope2 = sampleBOM.filter(i => i.scope === "Scope 2").reduce((s, i) => s + getValidCo2(i), 0);
      let scope3 = sampleBOM.filter(i => (i.scope || "Scope 3") === "Scope 3").reduce((s, i) => s + getValidCo2(i), 0);

      document.getElementById("kpi-total-co2").innerText = totalCo2.toFixed(3);
      document.getElementById("kpi-pending-count").innerText = pending;
      document.getElementById("kpi-credit-value").innerText = "₹" + creditVal.toLocaleString('en-IN');
      document.getElementById("kpi-progress-pct").innerText = pct + "%";
      document.getElementById("kpi-progress-bar").style.width = pct + "%";

      if (document.getElementById("kpi-scope1")) document.getElementById("kpi-scope1").innerText = scope1.toFixed(3) + " tCO₂e";
      if (document.getElementById("kpi-scope2")) document.getElementById("kpi-scope2").innerText = scope2.toFixed(3) + " tCO₂e";
      if (document.getElementById("kpi-scope3")) document.getElementById("kpi-scope3").innerText = scope3.toFixed(3) + " tCO₂e";

      document.getElementById("simBaseline").innerText = totalCo2.toFixed(3) + " tCO₂e";
      updateSim();
    }

    function updateSim() {
      let baseCo2 = parseFloat(document.getElementById("kpi-total-co2").innerText) || 0;
      let rec = parseInt(document.getElementById("simRecSlider").value);
      let ren = parseInt(document.getElementById("simRenSlider").value);
      
      document.getElementById("simRecVal").innerText = rec + "%";
      document.getElementById("simRenVal").innerText = ren + "%";

      let avoided = baseCo2 * ((rec * 0.4 + ren * 0.45) / 100);
      let val = Math.round(avoided * CREDIT_RATE_INR);

      document.getElementById("simAvoided").innerText = avoided.toFixed(3) + " tCO₂e";
      document.getElementById("simValuation").innerText = "₹" + val.toLocaleString('en-IN');
      document.getElementById("certAvoided").innerText = avoided.toFixed(3) + " tCO₂e";
      document.getElementById("certValue").innerText = "₹" + val.toLocaleString('en-IN');
    }

    function switchView(view) {
      document.querySelectorAll("[id^='view-']").forEach(v => v.classList.add("hidden"));
      let target = document.getElementById(`view-${view}`);
      if (target) target.classList.remove("hidden");

      document.querySelectorAll(".nav-link").forEach(l => {
        l.className = "nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full";
      });
      let activeNav = document.getElementById(`nav-${view}`);
      if (activeNav) {
        activeNav.className = "nav-link active flex items-center gap-3 px-4 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-semibold text-sm transition-all text-left w-full";
      }
    }

    function updateProjectSettings() {
      document.getElementById("b4Db").innerText = document.getElementById("dbSelect").value;
      renderTable();
    }

    
    // Firebase Initialization
    const firebaseConfig = {
      apiKey: "YOUR_FIREBASE_API_KEY",
      authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
      projectId: "YOUR_FIREBASE_PROJECT_ID",
      storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
      messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
      appId: "YOUR_FIREBASE_APP_ID"
    };

    let firebaseApp = null;
    let db = null;
    if (firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' && firebaseConfig.apiKey !== '{{FIREBASE_API_KEY}}') {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    }

    // Supabase Initialization
    const supabaseUrl = 'https://nepmqpdxolisxkbhmxn.supabase.co';
    const supabaseKey = 'sb_publishable_3_jOVeUeMgKc0iIHTBXikQ_BjzeV4lE';
    const supabase = supabaseUrl !== 'YOUR_SUPABASE_URL' ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

    // Auditor State
    let currentAuditor = {
      id: null,
      name: null,
      cert: null,
      authenticated: false,
      picture: null
    };

    // Check auth on load
    document.addEventListener("DOMContentLoaded", async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleAuthSuccess(session.user);
      }
      
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await handleAuthSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
          handleAuthSignOut();
        }
      });
    });

    async function handleAuthSuccess(user) {
      currentAuditor = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        cert: user.email,
        picture: user.user_metadata?.avatar_url,
        authenticated: true
      };
      updateAuditorUiState();
      await loadStateFromSupabase();
    }
    
    function handleAuthSignOut() {
      currentAuditor = { id: null, name: null, cert: null, authenticated: false, picture: null };
      currentProjectId = null;
      updateAuditorUiState();
      sampleBOM = [];
      renderTable();
    }

    async function signInWithGoogle() {
      if (!supabase) {
        alert("Supabase not configured. Please use valid credentials.");
        return;
      }
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
    }

    function updateAuditorUiState() {
      let btnText = document.getElementById("auditorLoginText");
      let btn = document.getElementById("auditorLoginBtn");
      if (currentAuditor.authenticated) {
        if (btnText) btnText.innerHTML = currentAuditor.picture 
            ? `<div class="flex items-center gap-1.5"><img src="${currentAuditor.picture}" class="w-4 h-4 rounded-full" /> <span>Verified: ${currentAuditor.name}</span></div>` 
            : `Verified: ${currentAuditor.name}`;
        if (btn) {
          btn.className = "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-extrabold text-emerald-900";
          // Remove default SVG icon if picture is present
          if (currentAuditor.picture) {
             let svg = btn.querySelector('svg');
             if (svg) svg.style.display = 'none';
          }
            btn.classList.add("bg-emerald-100", "text-emerald-900", "border-emerald-300");
            btn.classList.remove("bg-surface-container-high", "text-on-surface", "hover:bg-surface-container-highest");
            btn.onclick = signOutUser;
        }
      } else {
        if (btnText) btnText.innerText = "Auditor / User Login";
        if (btn) {
            btn.classList.remove("bg-emerald-100", "text-emerald-900", "border-emerald-300");
            btn.classList.add("bg-surface-container-high", "text-on-surface", "hover:bg-surface-container-highest");
            btn.onclick = signInWithGoogle;
        }
      }

      // Update Report Signatures
      let b4Stamp = document.getElementById("b4AuditStamp");
      if (b4Stamp) b4Stamp.innerText = currentAuditor.authenticated ? `Verified by: ${currentAuditor.name} (${currentAuditor.cert})` : "Verified by: Unauthenticated (Auditor Login Required)";
      
      let b4Name = document.getElementById("b4SignerName");
      if (b4Name) b4Name.innerText = currentAuditor.authenticated ? `${currentAuditor.name}` : "Not yet signed";
      
      let b4Body = document.getElementById("b4SignerBody");
      if (b4Body) b4Body.innerText = currentAuditor.authenticated ? `Google Authenticated User • Cert #${currentAuditor.cert}` : "—";
    }

    function downloadPdfReport() {
      window.print();
    }
    
    function downloadCertificate() {
      window.print();
    }

    function showSmsToast(msg) {
      let toast = document.createElement("div");
      toast.className = "fixed top-20 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl sci-shadow border border-white/20 animate-bounce flex items-center gap-2 max-w-sm";
      toast.style.background = "#0f172a";
      toast.innerHTML = `<span class="material-symbols-outlined text-emerald-400 text-base">sms</span> ${escapeHtml(msg)}`;
      document.body.appendChild(toast);
      setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 6000);
    }

    function openImportModal() { document.getElementById("importModal").classList.add("open"); }
    function closeImportModal() { document.getElementById("importModal").classList.remove("open"); }
    
    function openBig4Modal() {
      let isReady = true;
      if (!currentAuditor.authenticated) isReady = false;
      if (sampleBOM.length === 0) isReady = false;
      if (sampleBOM.some(item => !item.approved)) isReady = false;

      let totalFootprint = sampleBOM.reduce((acc, item) => acc + ((item.qty * item.ef) / 1000), 0);
      if (totalFootprint <= 0) isReady = false;

      let b4ReportStatus = document.getElementById("b4ReportStatus");
      let b4Conclusion = document.getElementById("b4Conclusion");
      let b4Ter = document.getElementById("b4Ter");
      let b4Ger = document.getElementById("b4Ger");
      let b4Tir = document.getElementById("b4Tir");
      let b4Uncertainty = document.getElementById("b4Uncertainty");

      if (isReady) {
        if (b4ReportStatus) b4ReportStatus.innerText = "PASSED ASSURANCE AUDIT";
        if (b4Conclusion) b4Conclusion.innerHTML = `<strong>Practitioner Conclusion:</strong> Based on the audit procedures performed, nothing has come to our attention that causes us to believe that the quantified GHG Inventory footprint of <strong id="b4Total" class="text-primary font-mono-data font-bold">${totalFootprint.toFixed(3)} tCO₂e</strong> is not prepared in all material respects in accordance with GHG Protocol and ISO 14064-1:2018 requirements.`;
        
        let avgTer = (sampleBOM.reduce((acc, item) => acc + (item.ter || 1), 0) / sampleBOM.length).toFixed(1);
        let avgGer = (sampleBOM.reduce((acc, item) => acc + (item.ger || 1), 0) / sampleBOM.length).toFixed(1);
        let avgTir = (sampleBOM.reduce((acc, item) => acc + (item.tir || 1), 0) / sampleBOM.length).toFixed(1);
        let dqrAvg = (parseFloat(avgTer) + parseFloat(avgGer) + parseFloat(avgTir)) / 3;
        let uncertainty = (dqrAvg * 3.5).toFixed(1);

        if (b4Ter) b4Ter.innerText = `${avgTer} / 5 (High)`;
        if (b4Ger) b4Ger.innerText = `${avgGer} / 5 (High)`;
        if (b4Tir) b4Tir.innerText = `${avgTir} / 5 (High)`;
        if (b4Uncertainty) b4Uncertainty.innerText = `±${uncertainty}%`;
      } else {
        if (b4ReportStatus) b4ReportStatus.innerText = "INSUFFICIENT DATA";
        if (b4Conclusion) b4Conclusion.innerHTML = `<strong>INSUFFICIENT DATA:</strong> Audit not performed.`;
        
        if (b4Ter) b4Ter.innerText = "—";
        if (b4Ger) b4Ger.innerText = "—";
        if (b4Tir) b4Tir.innerText = "—";
        if (b4Uncertainty) b4Uncertainty.innerText = "—";
      }

      let tbody = document.getElementById("b4TableBody");
      if (tbody) {
        tbody.innerHTML = "";
        sampleBOM.forEach(item => {
          let co2e = ((item.qty * item.ef) / 1000).toFixed(3);
          let scopeClass = item.scope === "Scope 1" ? "bg-purple-100 text-purple-900 border-purple-300" :
                           item.scope === "Scope 2" ? "bg-blue-100 text-blue-900 border-blue-300" :
                           "bg-amber-100 text-amber-900 border-amber-300";
          tbody.innerHTML += `
            <tr class="hover:bg-surface-container-low">
              <td class="p-2.5 font-bold"><span class="px-1.5 py-0.5 rounded text-[9px] border ${scopeClass}">${item.scope || 'Scope 3'}</span></td>
              <td class="p-2.5 font-semibold">${escapeHtml(item.name)}</td>
              <td class="p-2.5 text-right font-mono-data">${item.qty.toLocaleString()} ${escapeHtml(item.unit)}</td>
              <td class="p-2.5 truncate max-w-[200px] text-on-surface-variant">${escapeHtml(item.process)}</td>
              <td class="p-2.5 text-right font-mono-data">${item.ef}</td>
              <td class="p-2.5 text-right font-bold font-mono-data">${co2e} t</td>
            </tr>
          `;
        });
      }
      updateProjectHeader();
      document.getElementById("big4Modal").classList.add("open");
    }


    function closeBig4Modal() { document.getElementById("big4Modal").classList.remove("open"); }

    function openCertModal() {
      if (!currentAuditor.authenticated) {
        signInWithGoogle();
        return;
      }
      document.getElementById("certModal").classList.add("open");
    }

    function closeCertModal() { document.getElementById("certModal").classList.remove("open"); }

    function addManualItem(evt) {
      if (evt) evt.preventDefault();
      let name = document.getElementById("manualName").value.trim();
      let qty = parseFloat(document.getElementById("manualQty").value);
      let unit = document.getElementById("manualUnit").value;

      if (!name || isNaN(qty) || qty <= 0) return;

      let match = matchMaterial(name, unit);
      sampleBOM.unshift({
        id: Date.now(),
        name: name,
        qty: qty,
        unit: unit,
        process: match.process,
        ef: match.ef,
        sim: match.sim,
        ter: match.ter, ger: match.ger, tir: match.tir,
        risk: match.risk,
        status: match.status,
        approved: false
      });

      document.getElementById("manualName").value = "";
      closeImportModal();
      renderTable();
    }

    function handlePastedCsv() {
      let rawText = document.getElementById("pasteCsvArea").value;
      if (!rawText || !rawText.trim()) return;
      Papa.parse(rawText, {
        header: false,
        skipEmptyLines: 'greedy',
        complete: function(results) {
          if (results.data && results.data.length > 0) {
            parseMatrix(results.data);
            document.getElementById("pasteCsvArea").value = "";
          }
        }
      });
    }

    function handleFileUpload(evt) {
      let file = evt.target.files[0];
      if (!file) return;

      let filename = file.name.toLowerCase();

      if (filename.endsWith('.csv')) {
        Papa.parse(file, {
          header: false,
          skipEmptyLines: 'greedy',
          complete: function(results) {
            if (results.data && results.data.length > 0) {
              parseMatrix(results.data);
            }
          }
        });
      } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        let reader = new FileReader();
        reader.onload = function(e) {
          let data = new Uint8Array(e.target.result);
          let workbook = XLSX.read(data, { type: 'array' });
          let firstSheetName = workbook.SheetNames[0];
          let worksheet = workbook.Sheets[firstSheetName];
          let matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (matrix && matrix.length > 0) {
            parseMatrix(matrix);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }

    function parseMatrix(matrix) {
      let candidateRows = [];

      matrix.forEach((row, rIdx) => {
        if (!Array.isArray(row) || row.length === 0) return;

        let cells = row.map(c => (c !== null && c !== undefined) ? String(c).trim() : '');
        let firstCell = cells[0] || '';
        let firstLower = firstCell.toLowerCase();

        // Skip headers, totals, notes, formulas
        if (!firstCell ||
            firstLower.startsWith('scope ') ||
            firstLower.startsWith('category / item') ||
            firstLower.startsWith('category') ||
            firstLower.includes('total') ||
            firstLower.includes('note:') ||
            firstLower.includes('formula')) {
          return;
        }

        let name = firstCell;
        let rawQty = cells[1] || '';
        let unit = cells[2] || 'kg';
        let rawEf = cells[3] || '';

        let qty = parseFloat(rawQty);
        let ef = parseFloat(rawEf);

        if (isNaN(qty)) {
          let num1 = parseFloat(cells[0]);
          let num2 = parseFloat(cells[2]);
          if (!isNaN(num1) && isNaN(parseFloat(name))) {
            qty = num1;
            name = cells[1] || name;
          } else if (!isNaN(num2)) {
            qty = num2;
          }
        }

        if (!name || name.length < 2) return;

        // Skip subheaders with no quantity and no unit
        if ((isNaN(qty) || qty === 0) && (!cells[2] || cells[2].length === 0 || cells[2] === '0')) {
          return;
        }

        candidateRows.push({
          rawName: name,
          qty: isNaN(qty) ? 0 : qty,
          unit: unit || 'kg',
          ef: (!isNaN(ef) && ef > 0) ? ef : null,
          rowIdx: rIdx
        });
      });

      let activeRows = candidateRows.filter(r => r.qty > 0);
      let itemsToImport = activeRows.length > 0 ? activeRows : candidateRows.map(r => ({...r, qty: r.qty || 100}));

      if (itemsToImport.length === 0) {
        alert("No valid BOM materials found in the uploaded file.");
        return;
      }

      itemsToImport.forEach((item, idx) => {
        let match = matchMaterial(item.rawName, item.unit);
        let finalEf = item.ef !== null ? item.ef : match.ef;

        sampleBOM.unshift({
          id: Date.now() + idx,
          name: item.rawName,
          qty: item.qty,
          unit: item.unit,
          matchUnit: match.matchUnit || 'kg',
          process: item.ef !== null ? `${item.rawName} (Template Factor: ${item.ef} kgCO₂e/${item.unit})` : match.process,
          ef: finalEf,
          sim: item.ef !== null ? 0.99 : match.sim,
          ter: item.ef !== null ? 1 : match.ter,
          ger: item.ef !== null ? 1 : match.ger,
          tir: item.ef !== null ? 1 : match.tir,
          risk: item.ef !== null ? "LOW" : match.risk,
          status: "Auto-Matched",
          approved: true
        });
      });

      closeImportModal();
      renderTable();
    }

    function exportCSV() {
      let csvContent = "data:text/csv;charset=utf-8,Item,Quantity,Unit,Matched Process,Emission Factor,Risk,Footprint (tCO2e)\n";
      sampleBOM.forEach(i => {
        let co2e = ((i.qty * i.ef) / 1000).toFixed(3);
        let safeName = String(i.name || '').replace(/"/g, '""');
        let safeUnit = String(i.unit || '').replace(/"/g, '""');
        let safeProc = String(i.process || '').replace(/"/g, '""');
        let safeRisk = String(i.risk || '').replace(/"/g, '""');
        csvContent += `"${safeName}",${i.qty},"${safeUnit}","${safeProc}",${i.ef},"${safeRisk}",${co2e}\n`;
      });
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "NetZeroCalc_BOM_Export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function changeRowLciProcess(id, value) {
      let item = sampleBOM.find(i => i.id === id);
      if (!item) return;

      if (value === "custom") return;

      let mIdx = parseInt(value);
      let mat = materialDB[mIdx];
      if (mat) {
        item.process = mat.process;
        item.ef = mat.ef;
        item.sim = mat.sim;
        item.ter = mat.ter;
        item.ger = mat.ger;
        item.tir = mat.tir;
        item.scope = mat.scope;
        item.risk = "LOW";
        item.status = "Auditor Overridden";
        renderTable();
      }
    }

    function updateRowNotes(id, text) {
      let item = sampleBOM.find(i => i.id === id);
      if (item) {
        item.auditorNotes = text;
        saveState();
      }
    }

    function updateProjectHeader() {
      let proj = document.getElementById("projectNameInput").value.trim() || "EV Battery Assembly Line (India)";
      let comp = document.getElementById("companyNameInput").value.trim() || "ACME Corporation (Sample)";
      let std = document.getElementById("standardSelect").value;

      let b4Title = document.getElementById("b4Title");
      if (b4Title) b4Title.innerText = proj;
      let b4Comp = document.getElementById("b4Company");
      if (b4Comp) b4Comp.innerText = comp;
      let b4Std = document.getElementById("b4Std");
      if (b4Std) b4Std.innerText = std;

      let certProj = document.getElementById("certProjectName");
      if (certProj) certProj.innerText = `${proj} (${comp})`;

      let pRowProj = document.getElementById("projTableTitle");
      if (pRowProj) pRowProj.innerText = proj;
      let pRowStd = document.getElementById("projTableStd");
      if (pRowStd) pRowStd.innerText = std;

      saveState();
    }

    let saveTimeout = null;
    function saveState() {
      try {
        localStorage.setItem('netzerocalc_bom', JSON.stringify(sampleBOM));
        let meta = {
          proj: document.getElementById("projectNameInput")?.value || '',
          comp: document.getElementById("companyNameInput")?.value || '',
          std: document.getElementById("standardSelect")?.value || ''
        };
        localStorage.setItem('netzerocalc_meta', JSON.stringify(meta));

        // Debounced Real-Time Backend Persistence
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(syncData, 600);
      } catch(e) {}
    }

    async function loadStateFromSupabase() {
      if (!supabase || !currentAuditor.authenticated) {
        loadStateLocal(); // fallback to local
        return;
      }
      
      try {
        // Fetch the user's latest project
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', currentAuditor.id)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (projects && projects.length > 0) {
          const proj = projects[0];
          currentProjectId = proj.id;
          
          if (document.getElementById("projectNameInput")) document.getElementById("projectNameInput").value = proj.project_name || '';
          if (document.getElementById("companyNameInput")) document.getElementById("companyNameInput").value = proj.company_name || '';
          if (document.getElementById("standardSelect")) document.getElementById("standardSelect").value = proj.standard || '';
          updateProjectHeader();
          
          // Fetch BOM items
          const { data: items, error: itemsError } = await supabase
            .from('bom_items')
            .select('*')
            .eq('project_id', proj.id)
            .order('created_at', { ascending: true });
            
          if (itemsError) throw itemsError;
          
          if (items && items.length > 0) {
            sampleBOM = items.map(item => ({
              id: item.id, // Keep UUID for Supabase
              name: item.name,
              qty: parseFloat(item.qty),
              unit: item.unit,
              process: item.process,
              ef: parseFloat(item.ef),
              scope: item.scope,
              risk: item.risk,
              status: item.status,
              approved: item.approved,
              ter: parseFloat(item.ter),
              ger: parseFloat(item.ger),
              tir: parseFloat(item.tir),
              auditorNotes: item.auditor_notes
            }));
            renderTable();
          }
        } else {
          loadStateLocal();
        }
      } catch (e) {
        console.error("Error loading from Supabase", e);
        loadStateLocal();
      }
    }

    async function syncData() {
      if (!supabase || !currentAuditor.authenticated) return;
      
      let indicator = document.getElementById("saveIndicator");
      if(indicator) {
        indicator.classList.remove("hidden");
        indicator.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 transition-colors";
        indicator.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Saving...</span>';
      }
      
      try {
        let totalFootprint = sampleBOM.reduce((acc, item) => acc + ((item.qty * item.ef) / 1000), 0);
        let projData = {
          user_id: currentAuditor.id,
          project_name: document.getElementById("projectNameInput")?.value || 'EV Battery Assembly Line (India)',
          company_name: document.getElementById("companyNameInput")?.value || 'ACME Corporation (Sample)',
          standard: document.getElementById("standardSelect")?.value || 'ISO 14064-1 & GHG Protocol Scope 1-3',
          total_footprint: totalFootprint,
          updated_at: new Date().toISOString()
        };

        let projectId = currentProjectId;
        
        if (projectId) {
          const { error } = await supabase.from('projects').update(projData).eq('id', projectId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from('projects').insert([projData]).select();
          if (error) throw error;
          projectId = data[0].id;
          currentProjectId = projectId;
        }

        // Wipe existing BOM items and re-insert (simple sync)
        if (projectId) {
           await supabase.from('bom_items').delete().eq('project_id', projectId);
           if (sampleBOM.length > 0) {
             const itemsToInsert = sampleBOM.map(item => ({
                project_id: projectId,
                name: item.name,
                qty: item.qty,
                unit: item.unit,
                process: item.process,
                ef: item.ef,
                scope: item.scope,
                risk: item.risk,
                status: item.status,
                approved: item.approved,
                ter: item.ter || null,
                ger: item.ger || null,
                tir: item.tir || null,
                auditor_notes: item.auditorNotes || null
             }));
             const { error } = await supabase.from('bom_items').insert(itemsToInsert);
             if (error) throw error;
           }
        }
         // Dual Write to Firebase Realtime / Firestore if configured
         if (db && projectId) {
           try {
             await db.collection('projects').doc(projectId).set(projData);
             const batch = db.batch();
             if (sampleBOM.length > 0) {
               sampleBOM.forEach(item => {
                 let docRef = db.collection('projects').doc(projectId).collection('bom_items').doc(String(item.id));
                 batch.set(docRef, item);
               });
             }
             await batch.commit();
             console.log("Firebase sync successful.");
           } catch(fbErr) {
             console.warn("Firebase sync failed (check config/rules):", fbErr);
           }
         }
        
         if (indicator) {
           indicator.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors";
           indicator.innerHTML = '<span class="material-symbols-outlined text-sm">cloud_done</span><span>Saved</span>';
           setTimeout(() => { if(indicator) indicator.classList.add("hidden"); }, 2000);
        }
      } catch(e) {
        console.error(e);
        if(indicator) {
           indicator.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-error-container text-error border border-error/50 transition-colors";
           indicator.innerHTML = '<span class="material-symbols-outlined text-sm">cloud_off</span><span>Save Error</span>';
        }
      }
    }

    function loadStateLocal() {
      try {
        let saved = localStorage.getItem('netzerocalc_bom');
        if (saved) {
          let parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) sampleBOM = parsed;
        }
        let savedMeta = localStorage.getItem('netzerocalc_meta');
        if (savedMeta) {
          let meta = JSON.parse(savedMeta);
          if (meta.proj && document.getElementById("projectNameInput")) document.getElementById("projectNameInput").value = meta.proj;
          if (meta.comp && document.getElementById("companyNameInput")) document.getElementById("companyNameInput").value = meta.comp;
          if (meta.std && document.getElementById("standardSelect")) document.getElementById("standardSelect").value = meta.std;
          updateProjectHeader();
        }
      } catch(e) {}
    }

    async function checkSupabaseHealth() {
      try {
        let el = document.getElementById("backend-status-pill");
        if (supabase) {
          if (el) {
            el.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> Supabase Connected';
          }
        } else {
          if (el) {
            el.className = "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-600"></span> Local Only';
          }
        }
      } catch(e) {}
    }

    loadStateLocal();
    checkSupabaseHealth();

    // --- Spreadsheet / Excel CSV Integration Logic ---
    function openExcelModal() {
      populateExcelTable();
      document.getElementById("excelModal").classList.add("open");
    }

    function closeExcelModal() {
      document.getElementById("excelModal").classList.remove("open");
    }

    function populateExcelTable() {
      const tbody = document.getElementById("excelTableBody");
      tbody.innerHTML = "";
      
      materialDB.forEach((item, index) => {
        let tr = document.createElement("tr");
        tr.className = "hover:bg-surface-container-lowest transition-colors";
        tr.innerHTML = `
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.scope)}</td>
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.category)}</td>
          <td class="p-2 border-b border-outline-variant/30 font-bold">${escapeHtml(item.process)}</td>
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.unit)}</td>
          <td class="p-2 border-b border-outline-variant/30">${item.ef}</td>
          <td class="p-2 border-b border-outline-variant/30 bg-emerald-50/50">
            <input type="number" id="excel-qty-${index}" min="0" step="any" placeholder="0" class="w-24 p-1 text-xs border border-emerald-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 bg-white">
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function syncExcelToBom() {
      let added = 0;
      materialDB.forEach((item, index) => {
        let qtyInput = document.getElementById(`excel-qty-${index}`);
        if (qtyInput) {
          let qty = parseFloat(qtyInput.value);
          if (!isNaN(qty) && qty > 0) {
            // Add to BOM
            sampleBOM.push({
              id: Date.now() + Math.random(),
              name: `Imported from Master Sheet: ${item.process}`,
              qty: qty,
              unit: item.unit,
              process: item.process,
              ef: item.ef,
              sim: 1.0, // Perfect match since it's from the sheet
              ter: 1, ger: 1, tir: 1,
              risk: "LOW",
              scope: item.scope,
              status: "Auto-Matched",
              approved: false
            });
            added++;
            qtyInput.value = ""; // reset
          }
        }
      });
      
      if (added > 0) {
        showSmsToast(`Successfully imported ${added} items from Master Sheet!`);
        renderTable();
        saveState();
        closeExcelModal();
      } else {
        closeExcelModal();
      }
    }

    renderTable();
  