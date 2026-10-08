import React, { Dispatch, SetStateAction } from "react";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import SearchSelectMultipleEmployees from "@/components/shared/inputs/dropdowns/SearchSelectMultipleEmployees";
import { IEmployee } from "@/lib/models/employee.model";

interface OldStepPersonnelProps {
  setSupervisors: Dispatch<SetStateAction<IEmployee[]>>;
  setEmployees: Dispatch<SetStateAction<IEmployee[]>>;
  requireSupervisors?: boolean;
  savedSupervisors: IEmployee[];
  savedEmployees: IEmployee[];
}

const OldStepPersonnel: React.FC<OldStepPersonnelProps> = ({ setSupervisors, setEmployees, requireSupervisors, savedSupervisors, savedEmployees }) => {
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
            value={savedSupervisors}
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
            value={savedEmployees}
          />
        }
      />
    </div>
  );
};

export default OldStepPersonnel;