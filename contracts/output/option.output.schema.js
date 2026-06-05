export const OptionMap = {
  id: true,
  groupId: true,
  name: true,
  basePrice: true,
  sortOrder: true,
  isActive: true,
};

export const OptionGroupMap = {
  id: true,
  name: true,
  isRequired: true,
  isMultiple: true,
  sortOrder: true,
  isActive: true,
  options: [OptionMap],
};
