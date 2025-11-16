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
