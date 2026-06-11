export const ProductMap = {
  id: true,
  sku: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  basePrice: true,
  costPrice: true,
  taxRate: true,
  thumbnail: true,
  images: true,
  categoryId: true,
  category: {
    id: true,
    name: true,
    slug: true,
  },
  sortOrder: true,
  preparationTime: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  optionGroups: (source) => {
    return (source.optionGroups || []).map((ogEntry) => {
      const og = ogEntry.optionGroup;
      return {
        id: og.id,
        name: og.name,
        isRequired: og.isRequired,
        isMultiple: og.isMultiple,
        sortOrder: og.sortOrder,
        options: og.options.map((opt) => {
          // Find the product-specific price for this option
          const optionValue = (source.optionValues || []).find(
            (ov) => ov.optionId === opt.id
          );
          
          return {
            id: opt.id,
            name: opt.name,
            basePrice: opt.basePrice,
            price: optionValue ? optionValue.price : opt.basePrice, // Use specific price if exists, else basePrice
            sortOrder: opt.sortOrder,
          };
        }),
      };
    });
  },
};
