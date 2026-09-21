import { Sector, ActivityType, DemoScenario } from './types';

export const SECTORS_INFO = {
  FURNITURE: {
    id: 'FURNITURE' as Sector,
    name: 'Furniture & Wood Products',
    description: 'Wooden, office, home, modular furniture, panel processing, polishing, and wood treatment.',
    categories: {
      'Manufacturing': [
        'Wooden furniture manufacturing',
        'Home furniture manufacturing',
        'Office furniture manufacturing',
        'Modular furniture manufacturing',
        'Kitchen furniture manufacturing',
        'Wooden door manufacturing',
        'Wooden window manufacturing',
        'Bed manufacturing',
        'Table manufacturing',
        'Chair manufacturing',
        'Cabinet manufacturing',
        'MDF furniture manufacturing',
        'Plywood furniture manufacturing',
        'Wood-based products manufacturing'
      ],
      'Processing': [
        'Wood cutting',
        'Wood seasoning',
        'Wood treatment',
        'Wood machining',
        'Wood shaping',
        'Wood sanding',
        'Wood panel processing'
      ],
      'Surface / Chemical Processing': [
        'Furniture polishing',
        'Furniture painting',
        'Furniture coating',
        'Varnishing',
        'Lamination',
        'Adhesive application'
      ],
      'Assembly': [
        'Modular furniture assembly',
        'Furniture installation',
        'Ready-to-assemble furniture'
      ],
      'Trading': [
        'Timber trading',
        'Furniture trading',
        'Wood-product trading',
        'Furniture wholesale'
      ],
      'Retail / Sale': [
        'Furniture showroom',
        'Furniture retail',
        'Online furniture sales',
        'Custom furniture sales'
      ],
      'Repair / Service': [
        'Furniture repair',
        'Furniture restoration',
        'Furniture polishing service',
        'Furniture installation service',
        'Carpentry workshop'
      ]
    }
  },
  TEXTILES: {
    id: 'TEXTILES' as Sector,
    name: 'Textiles & Garments',
    description: 'Readymade garments, textile dyeing, processing, printing, tailoring, and wholesale trade.',
    categories: {
      'Manufacturing': [
        'Readymade garments',
        'T-shirts',
        'Shirts',
        'Trousers',
        'School uniforms',
        'Industrial uniforms',
        'Home textiles',
        'Textile products'
      ],
      'Processing': [
        'Dyeing',
        'Bleaching',
        'Washing',
        'Fabric processing',
        'Textile finishing',
        'Fabric treatment'
      ],
      'Printing / Decoration': [
        'Textile printing',
        'Garment printing',
        'Screen printing',
        'Digital printing',
        'Embroidery',
        'Embellishment'
      ],
      'Garment Production': [
        'Fabric cutting',
        'Stitching',
        'Sewing',
        'Garment assembly',
        'Finishing',
        'Packing'
      ],
      'Trading': [
        'Textile trading',
        'Fabric wholesale',
        'Garment wholesale',
        'Textile distribution'
      ],
      'Retail / Sale': [
        'Garment showroom',
        'Clothing retail',
        'Textile shop',
        'Online clothing sales',
        'Fashion store'
      ],
      'Repair / Service': [
        'Tailoring',
        'Garment alteration',
        'Embroidery service',
        'Printing service',
        'Washing/finishing service'
      ]
    }
  },
  AUTOMOTIVE: {
    id: 'AUTOMOTIVE' as Sector,
    name: 'Automobiles & EV',
    description: 'Electric vehicles, components, battery assembly, charging, showrooms, and service centres.',
    categories: {
      'Manufacturing': [
        'Automobile manufacturing',
        'EV manufacturing',
        'Auto component manufacturing',
        'Body fabrication',
        'Motor manufacturing',
        'Charger manufacturing',
        'Electrical component manufacturing'
      ],
      'EV Assembly': [
        'EV two-wheeler assembly',
        'EV three-wheeler assembly',
        'EV component assembly',
        'Battery pack assembly',
        'Motor/controller assembly'
      ],
      'Battery-Related': [
        'Battery pack assembly',
        'Battery-related component manufacturing',
        'Battery storage',
        'Battery servicing'
      ],
      'Trading': [
        'Automobile trading',
        'EV trading',
        'Auto component trading',
        'EV component trading',
        'Spare-parts wholesale',
        'Spare-parts distribution'
      ],
      'Retail / Sale': [
        'Automobile showroom',
        'EV showroom',
        'Spare-parts shop',
        'EV accessories shop',
        'Charger sales'
      ],
      'Repair / Service': [
        'Automobile service centre',
        'EV service centre',
        'EV charger installation',
        'EV maintenance',
        'Battery servicing',
        'Automobile repair'
      ],
      'Storage / Distribution': [
        'Automobile warehouse',
        'EV component warehouse',
        'Spare-parts warehouse',
        'Distribution centre'
      ]
    }
  }
};

export const ACTIVITY_MAPPING: Record<ActivityType, string> = {
  'Manufacturing': 'Manufacture',
  'Processing': 'Process',
  'Assembly': 'Assemble',
  'Trading': 'Buy & Sell',
  'Wholesale': 'Wholesale',
  'Retail / Sale': 'Retail',
  'Repair / Service': 'Repair / Service',
  'Storage / Warehouse': 'Store / Warehouse',
  'Distribution': 'Distribute',
  'Installation': 'Install',
  'Import / Export': 'Import / Export',
  'Other': 'Other'
};

export const STATES_AND_DISTRICTS = [
  { state: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Thane', 'Nagpur', 'Nashik'] },
  { state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Tiruppur', 'Salem', 'Madurai'] },
  { state: 'Karnataka', districts: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
  { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
  { state: 'Delhi', districts: ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'West Delhi'] },
  { state: 'Telangana', districts: ['Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Sangareddy'] },
  { state: 'Uttar Pradesh', districts: ['Noida (Gautam Buddha Nagar)', 'Ghaziabad', 'Kanpur', 'Lucknow', 'Agra'] }
];

export const LAND_STATUS_OPTIONS = [
  'Owned',
  'Leased',
  'Rented',
  'To be allotted',
  'Under acquisition',
  'Other'
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'S1',
    name: 'Scenario 1: Wood Furniture Manufacturer',
    sector: 'FURNITURE',
    activities: ['Manufacturing', 'Processing'],
    specificActivities: ['Wooden furniture manufacturing', 'Wood cutting', 'Furniture polishing'],
    description: 'I buy raw solid wood, cut it using circular saws, make home and office wooden furniture, polish them with synthetic varnishes, and sell them wholesale to other traders.',
    location: {
      state: 'Karnataka',
      district: 'Bengaluru',
      city: 'Peenya Industrial Area',
      industrialArea: 'Peenya Estate Phase 1',
      landStatus: 'Owned'
    },
    projectSize: {
      investment: 45.0,
      capacity: '500 units of wooden furniture per month',
      power: 25.0,
      employees: 18,
      area: 3200,
      water: 2.0
    },
    answers: {
      woodMaterial: 'Solid wood',
      woodCutting: true,
      paintPolishVarnish: true,
      adhesivesUsed: true,
      machineryUsed: true,
      hazardousWaste: false
    }
  },
  {
    id: 'S2',
    name: 'Scenario 2: Furniture Retailer',
    sector: 'FURNITURE',
    activities: ['Retail / Sale'],
    specificActivities: ['Furniture showroom', 'Furniture retail'],
    description: 'I rent a showroom in a busy commercial market. I buy readymade furniture from manufacturers in Rajasthan and sell it directly to retail customers.',
    location: {
      state: 'Maharashtra',
      district: 'Mumbai',
      city: 'Andheri West',
      industrialArea: 'None (Commercial Shop)',
      landStatus: 'Rented'
    },
    projectSize: {
      investment: 15.0,
      capacity: 'Showroom display and trading of furniture',
      power: 3.0,
      employees: 4,
      area: 1200,
      water: 0.5
    },
    answers: {
      showroomLocation: 'Commercial High Street',
      isShoppingMall: false,
      employeesCount: 4,
      fireSafetyAudit: true
    }
  },
  {
    id: 'S3',
    name: 'Scenario 3: Furniture Manufacturer + Showroom',
    sector: 'FURNITURE',
    activities: ['Manufacturing', 'Retail / Sale'],
    specificActivities: ['Home furniture manufacturing', 'Furniture showroom', 'Custom furniture sales', 'Wood panel processing', 'Furniture polishing'],
    description: 'We have a composite facility where modular and solid wood furniture is manufactured on the ground floor, and we have a premium showroom on the first floor for direct retail sales.',
    location: {
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Gachibowli',
      industrialArea: 'None (Standalone Building)',
      landStatus: 'Leased'
    },
    projectSize: {
      investment: 80.0,
      capacity: '1000 items of custom furniture per year',
      power: 15.0,
      employees: 12,
      area: 4500,
      water: 1.2
    },
    answers: {
      woodMaterial: 'Mixed (Solid wood & MDF)',
      woodCutting: true,
      paintPolishVarnish: true,
      adhesivesUsed: true,
      machineryUsed: true,
      showroomLocation: 'Combined Commercial & Industrial Compound',
      employeesCount: 12
    }
  },
  {
    id: 'S4',
    name: 'Scenario 4: Garment Factory (No Wet Process)',
    sector: 'TEXTILES',
    activities: ['Manufacturing', 'Assembly'],
    specificActivities: ['Readymade garments', 'Fabric cutting', 'Stitching', 'Sewing', 'Finishing', 'Packing'],
    description: 'We stitch high-quality school and industrial uniforms. We procure finished cotton and polyester rolls, cut fabric, stitch, pack, and ship. We do not perform any dyeing or bleaching.',
    location: {
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      city: 'SIDCO Industrial Estate',
      industrialArea: 'SIDCO Estate',
      landStatus: 'Leased'
    },
    projectSize: {
      investment: 35.0,
      capacity: '10,000 garment pieces per month',
      power: 12.0,
      employees: 30,
      area: 2500,
      water: 1.0
    },
    answers: {
      textileMaterial: 'Cotton & Polyester',
      useDyesBleach: false,
      generateWastewater: false,
      waterTreatmentPlant: false,
      hasBoiler: false,
      machineryUsed: true
    }
  },
  {
    id: 'S5',
    name: 'Scenario 5: Textile Dyeing Unit (Wet Process)',
    sector: 'TEXTILES',
    activities: ['Processing'],
    specificActivities: ['Dyeing', 'Bleaching', 'Washing', 'Fabric processing'],
    description: 'We are a dedicated textile wet processing factory. We receive raw fabrics, wash them, bleach them, and dye them using synthetic dyes, generating industrial wastewater.',
    location: {
      state: 'Tamil Nadu',
      district: 'Tiruppur',
      city: 'Netaji Apparel Park',
      industrialArea: 'Netaji Apparel Park Zone 4',
      landStatus: 'Owned'
    },
    projectSize: {
      investment: 120.0,
      capacity: '2 tons of fabric processed daily',
      power: 45.0,
      employees: 22,
      area: 6000,
      water: 40.0
    },
    answers: {
      textileMaterial: 'Cotton & Rayon',
      useDyesBleach: true,
      dyeChemicalsType: 'Reactive dyes, Sodium Hypochlorite, Softeners',
      dailyWaterUsage: '40,000 litres',
      generateWastewater: true,
      wastewaterTreatment: 'In-house Effluent Treatment Plant (ETP) + RO Zero Liquid Discharge (ZLD)',
      treatmentFacility: 'Yes (35 KLD ETP installed)',
      processInhouse: 'In-house',
      hasBoiler: true,
      boilerFuel: 'Briquet / Wood biomass'
    }
  },
  {
    id: 'S6',
    name: 'Scenario 6: Garment Manufacturer + Dyeing',
    sector: 'TEXTILES',
    activities: ['Manufacturing', 'Processing'],
    specificActivities: ['Readymade garments', 'Dyeing', 'Textile printing', 'Screen printing', 'Stitching', 'Finishing'],
    description: 'An integrated facility that takes yarn/greige fabric, dyes it in-house, screen prints designs, and then cuts and sews them into fashionable t-shirts for retail.',
    location: {
      state: 'Maharashtra',
      district: 'Thane',
      city: 'Bhiwandi',
      industrialArea: 'Bhiwandi Textile Cluster',
      landStatus: 'Leased'
    },
    projectSize: {
      investment: 195.0,
      capacity: '15,000 printed/dyed t-shirts per month',
      power: 55.0,
      employees: 45,
      area: 8000,
      water: 15.0
    },
    answers: {
      textileMaterial: 'Cotton',
      useDyesBleach: true,
      dyeChemicalsType: 'Direct and Pigment dyes, screen print binders',
      generateWastewater: true,
      wastewaterTreatment: 'Common Effluent Treatment Plant (CETP) membership and pre-treatment facility',
      treatmentFacility: 'Yes (CETP Outlet Tank)',
      processInhouse: 'In-house',
      hasBoiler: true,
      boilerFuel: 'Coal/Gas fired'
    }
  },
  {
    id: 'S7',
    name: 'Scenario 7: Garment Wholesaler',
    sector: 'TEXTILES',
    activities: ['Trading', 'Wholesale', 'Storage / Warehouse'],
    specificActivities: ['Garment wholesale', 'Textile trading', 'Textile distribution'],
    description: 'I run a wholesale textile trading company. I stock bulk cartons of readymade garments in a rented warehouse and distribute them to retail showrooms across India.',
    location: {
      state: 'Delhi',
      district: 'North Delhi',
      city: 'Narela Warehouse Zone',
      industrialArea: 'Narela Logistic Park',
      landStatus: 'Rented'
    },
    projectSize: {
      investment: 25.0,
      capacity: '100,000 pieces in storage capacity',
      power: 2.0,
      employees: 6,
      area: 3500,
      water: 0.2
    },
    answers: {
      warehouseType: 'Dry Storage',
      hasFireHydrant: true,
      highStacking: true,
      employeesCount: 6
    }
  },
  {
    id: 'S8',
    name: 'Scenario 8: EV Assembly Unit',
    sector: 'AUTOMOTIVE',
    activities: ['Assembly'],
    specificActivities: ['EV two-wheeler assembly', 'EV component assembly', 'Battery pack assembly', 'Motor/controller assembly'],
    description: 'We import components, assemble high-performance electric two-wheelers, mount assembled lithium-ion battery packs, test them and distribute to dealerships.',
    location: {
      state: 'Pune',
      district: 'Pune',
      city: 'Chakan Industrial Phase II',
      industrialArea: 'Chakan MIDC',
      landStatus: 'To be allotted'
    },
    projectSize: {
      investment: 280.0,
      capacity: '200 electric scooters per month',
      power: 60.0,
      employees: 35,
      area: 12000,
      water: 4.0
    },
    answers: {
      assemblyType: 'Electric Two-Wheeler',
      batteryPackAssembly: true,
      batteryStorageQty: 'Up to 500 battery units at a time',
      isCellMfg: false,
      machineryUsed: true,
      handlingHazMat: true
    }
  },
  {
    id: 'S9',
    name: 'Scenario 9: EV Showroom',
    sector: 'AUTOMOTIVE',
    activities: ['Retail / Sale'],
    specificActivities: ['EV showroom', 'Automobile showroom', 'Charger sales'],
    description: 'An premium electric vehicle showroom showcasing high-speed electric scooters and charging hardware accessories with a modern client lounge.',
    location: {
      state: 'Karnataka',
      district: 'Bengaluru',
      city: 'Indiranagar',
      industrialArea: 'None (Premium Retail)',
      landStatus: 'Leased'
    },
    projectSize: {
      investment: 60.0,
      capacity: '12-15 display vehicles, parts, accessories',
      power: 8.0,
      employees: 8,
      area: 2800,
      water: 0.4
    },
    answers: {
      showroomLocation: 'Main Commercial Ring Road',
      hasChargingStation: true,
      maxChargerRating: '22kW AC charger installation',
      employeesCount: 8
    }
  },
  {
    id: 'S10',
    name: 'Scenario 10: EV Service Centre',
    sector: 'AUTOMOTIVE',
    activities: ['Repair / Service'],
    specificActivities: ['EV service centre', 'Battery servicing', 'EV maintenance', 'Automobile repair'],
    description: 'We provide specialized repair, mechanical maintenance, wheel alignment, electronic system diagnostics, and safe lithium-ion battery health diagnostics and servicing.',
    location: {
      state: 'Maharashtra',
      district: 'Pune',
      city: 'Hadapsar',
      industrialArea: 'None (Hadapsar Commercial Zone)',
      landStatus: 'Rented'
    },
    projectSize: {
      investment: 30.0,
      capacity: '15-20 vehicles serviced per day',
      power: 12.0,
      employees: 10,
      area: 2400,
      water: 2.5
    },
    answers: {
      isBatteryServicing: true,
      dischargesWastewater: true,
      hasOilGritSeparator: true,
      employeesCount: 10,
      generatesEwaste: true
    }
  },
  {
    id: 'S11',
    name: 'Scenario 11: EV Component Manufacturer',
    sector: 'AUTOMOTIVE',
    activities: ['Manufacturing'],
    specificActivities: ['Auto component manufacturing', 'Motor manufacturing', 'Charger manufacturing', 'Electrical component manufacturing'],
    description: 'We operate a specialized manufacturing plant for EV hub motors and DC-to-DC converters. We run winding machines, PCB assembly setups, wave soldering, and testing rigs.',
    location: {
      state: 'Gujarat',
      district: 'Ahmedabad',
      city: 'Sanand Industrial Estate',
      industrialArea: 'GIDC Sanand',
      landStatus: 'Owned'
    },
    projectSize: {
      investment: 350.0,
      capacity: '5000 BLDC motors per month',
      power: 110.0,
      employees: 50,
      area: 15000,
      water: 5.0
    },
    answers: {
      autoComponentsType: 'Hub Motors & Electronic Controllers',
      waveSoldering: true,
      hasPcbAssembly: true,
      hazardousChemicals: true,
      airEmissions: true
    }
  },
  {
    id: 'S12',
    name: 'Scenario 12: EV Battery Pack Assembly (No Chemical Cell Mfg)',
    sector: 'AUTOMOTIVE',
    activities: ['Assembly'],
    specificActivities: ['Battery pack assembly', 'EV component assembly', 'Battery storage'],
    description: 'We import cylindrical LiFePO4 cells, assemble them into custom modules with smart BMS boards, weld nickel strips, wrap in insulation/casing, and perform battery lifecycle testing.',
    location: {
      state: 'Uttar Pradesh',
      district: 'Noida (Gautam Buddha Nagar)',
      city: 'Noida Sector 80',
      industrialArea: 'Noida Industrial Zone Phase II',
      landStatus: 'Leased'
    },
    projectSize: {
      investment: 140.0,
      capacity: '300 battery packs assembled per month',
      power: 45.0,
      employees: 16,
      area: 4800,
      water: 1.5
    },
    answers: {
      batteryPackAssembly: true,
      isCellMfg: false,
      performsWelding: true,
      testingUnderVoltage: true,
      hazardousWasteBattery: true,
      storageSafetyVents: true
    }
  }
];
