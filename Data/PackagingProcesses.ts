export type TPackagingProcess = {
  label: string;
  id?: string;
  hint?: string;
  inputValue?: string;
};

export const PACKAGING_PROCESSES:TPackagingProcess[] = [
  { id: "19", label: "Aseptic Packaging", hint: "Sterile packaging process" },
  { id: "2", label: "Bagging", hint: "Packaging products into bags" },
  { id: "23", label: "Boxing", hint: "Packing items into boxes" },
  { id: "8", label: "Blister Packaging", hint: "Sealing items in plastic cavities" },
  { id: "24", label: "Bundling", hint: "Grouping multiple items together" },
  { id: "1", label: "Bottling", hint: "Packaging liquids into bottles" },
  { id: "5", label: "Canning", hint: "Sealing products in metal cans" },
  { id: "15", label: "Case Packing", hint: "Packaging items into cases" },
  { id: "6", label: "Cartoning", hint: "Packaging items into cartons" },
  { id: "9", label: "Clamshell Packaging", hint: "Encasing products in rigid plastic shells" },
  { id: "22", label: "Crating", hint: "Packaging goods in rigid crates" },
  { id: "17", label: "Drum Filling", hint: "Filling drums with materials" },
  { id: "11", label: "Filling", hint: "General filling of containers" },
  { id: "13", label: "Labeling", hint: "Applying labels to products" },
  { id: "20", label: "MAP Packaging", hint: "Modified atmosphere packaging" },
  { id: "14", label: "Palletizing", hint: "Arranging goods on pallets" },
  { id: "21", label: "Pallet Hooding", hint: "Applying stretch hoods to pallet loads" },
  { id: "3", label: "Pouching", hint: "Packaging products into pouches" },
  { id: "18", label: "Vacuum Packaging", hint: "Removing air before sealing" },
  { id: "4", label: "Sacheting", hint: "Packaging products into small sachets" },
  { id: "12", label: "Sealing", hint: "Closing or sealing packaging" },
  { id: "10", label: "Tray Packaging", hint: "Placing items into trays" },
  { id: "7", label: "Wrapping", hint: "Enclosing items with wrap or film" },
  { id: "16", label: "Tube Filling", hint: "Filling and sealing tubes" },

  // Must remain last
  { id: "99", label: "Other", hint: "Other packaging methods not listed" }
];


export const PACKAGING_CATEGORY:TPackagingProcess[] = [
  {id:'1', label:'Packaging', hint:'Packaging products into boxes'},
  {id:'2', label:'Labeling', hint:'Applying labels to products'},
  {id:'3', label:'Additive', hint:'Adding additives to products'},
  {id:'99', label:'Other', hint:'Other packaging methods not listed'}
]


export const PACKAGING_SUBCATEGORY: TPackagingProcess[] = [
  { id: "1", label: "Bottle", hint: "Used to package liquid products" },
  { id: "2", label: "Label", hint: "Product identification and branding" },
  { id: "3", label: "Box", hint: "Outer packaging for protection or shipping" },
  { id: "4", label: "Sack", hint: "Bulk or granular product packaging" },
  { id: "5", label: "Cap", hint: "Closure used to seal containers" },
  { id: "6", label: "Carton", hint: "Paperboard container for retail packaging" },
  { id: "7", label: "Seal", hint: "Used to secure and protect packaged items" },
  { id: "8", label: "Cleaning Agent", hint: "Used to clean packaging surfaces" },

  // Additional subcategories
  { id: "9", label: "Shrink Wrap", hint: "Plastic film used to tightly wrap products" },
  { id: "10", label: "Pouch", hint: "Flexible packaging for small or soft items" },
  { id: "11", label: "Tube", hint: "Cylindrical packaging for creams or gels" },
  { id: "12", label: "Jar", hint: "Glass or plastic container for solids or semi-liquids" },
  { id: "13", label: "Container", hint: "General-purpose product holder" },
  { id: "14", label: "Tape", hint: "Used for sealing or reinforcing packaging" },
  { id: "15", label: "Insert", hint: "Internal support or informational material" },
  { id: "16", label: "Lid", hint: "Top cover for jars, containers, and trays" },
  { id: "17", label: "Foil", hint: "Protective metallic wrap for sealing or lining" },
  { id: "18", label: "Tray", hint: "Flat packaging base for food or products" },
  { id: "19", label: "Sticker", hint: "Additional branding or information label" },

  {id:'99', label:'Other', hint:'Other packaging item not listed'}
];
