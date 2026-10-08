import React, { Dispatch, SetStateAction } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectMultipleEmployees from "@/components/shared/inputs/dropdowns/SearchSelectMultipleEmployees";
import { IEmployee } from "@/lib/models/employee.model";

interface StepPersonnelProps {
  setSupervisors: Dispatch<SetStateAction<IEmployee[]>>;
  setEmployees: Dispatch<SetStateAction<IEmployee[]>>;
  requireSupervisors?: boolean;
}

const StepPersonnel: React.FC<StepPersonnelProps> = ({ setSupervisors, setEmployees, requireSupervisors }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <GenericLabel
        label="Select supervisors *"
        input={
          <SearchSelectMultipleEmployees
            showMe={true}
            required={requireSupervisors}
            setSelection={setSupervisors}
            placeholder="supervisors"
          />
        }
      />
      <GenericLabel
        label="Select employees"
        input={
          <SearchSelectMultipleEmployees
            setSelection={setEmployees}
            placeholder="employees"
            showMe={true}
          />
        }
      />
    </div>
  );
};

export default StepPersonnel;