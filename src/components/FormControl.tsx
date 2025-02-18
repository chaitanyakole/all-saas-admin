import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useMediaQuery } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: "auto",
    },
  },
};

interface MultipleSelectCheckmarksProps {
  names: string[];
  codes: string[];
  tagName: string;
  selectedCategories: string[];
  onCategoryChange: (selectedNames: string[], selectedCodes: string[]) => void;
  disabled?: boolean;
  overall?: boolean;
  defaultValue?: string;
}

const MultipleSelectCheckmarks: React.FC<MultipleSelectCheckmarksProps> = ({
  names,
  codes,
  tagName,
  selectedCategories = [],
  onCategoryChange,
  disabled = false,
  overall = false,
  defaultValue,
}) => {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm")
  );
  const isMediumScreen = useMediaQuery("(max-width:900px)");

  const handleChange = (
    event: SelectChangeEvent<typeof selectedCategories>
  ) => {
    const {
      target: { value },
    } = event;

    let selectedNames = typeof value === "string" ? value.split(",") : value;

    if (selectedNames.includes("all")) {
      selectedNames = defaultValue ? [defaultValue] : ["All"];
    }

    const selectedCodes = selectedNames.map(
      (name) => codes[names.indexOf(name)]
    );

    onCategoryChange(selectedNames, selectedCodes);
  };

  return (
    <div>
      <FormControl sx={{ width: "100%" }} disabled={disabled}>
        <InputLabel id="multiple-checkbox-label">{tagName}</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          id="multiple-checkbox"
          value={
            selectedCategories?.length <= 0 || selectedCategories[0] === ""
              ? ["All"]
              : selectedCategories
          }
          onChange={handleChange} // Handle the change event for the selection
          input={<OutlinedInput label={tagName} />}
          renderValue={(selected) => {
            // Ensure selected is always an array, even if one item is selected
            const selectedArray = Array.isArray(selected)
              ? selected
              : [selected];

            // Get the corresponding names for the selected tenant IDs
            const selectedNames = selectedArray
              .map((tenantId) => {
                const index = codes.indexOf(tenantId); // Find the corresponding name using `codes`
                return index >= 0 ? names[index] : tenantId; // Map tenantId to name or return tenantId if not found
              })
              .filter((name) => name !== ""); // Filter out empty values

            // Return single or multiple selected names
            if (selectedNames.length === 1) {
              return selectedNames[0]; // Return single selected name
            }
            return selectedNames.join(", "); // Join multiple selected names with commas
          }}
          MenuProps={MenuProps}
        >
          {overall && (
            <MenuItem value="all">
              <em>{t("COMMON.ALL")}</em>
            </MenuItem>
          )}

          {/* Render menu items for available names */}
          {names?.map((name) => (
            <MenuItem key={name} value={name}>
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default MultipleSelectCheckmarks;
