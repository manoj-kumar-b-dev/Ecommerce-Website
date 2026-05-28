import { Check, Edit, Trash2, MapPin } from 'lucide-react';

/**
 * Reusable AddressCard component for displaying user addresses
 * Supports highlighting default address, edit, and delete actions
 */
const AddressCard = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  showDefaultBadge = true
}) => {
  return (
    <div
      className={`p-4 rounded-lg border transition-all cursor-pointer ${isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      onClick={() => onSelect && onSelect(address)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {showDefaultBadge && address.isDefault && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-success-100 text-success-700 rounded-full">
                <Check className="h-3 w-3 mr-1" />
                Default
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{address.name}</p>
          <p className="text-sm text-gray-600">{address.phone}</p>
          <p className="text-sm text-gray-600 mt-1">{address.street}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="text-xs text-gray-500 mt-1">{address.country}</p>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {!address.isDefault && onSetDefault && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(address._id);
                }}
                className="p-1.5 text-gray-500 hover:text-primary-600 rounded transition-colors"
                title="Set as default"
              >
                <MapPin className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="p-1.5 text-gray-500 hover:text-primary-600 rounded transition-colors"
                title="Edit address"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
                className="p-1.5 text-gray-500 hover:text-danger-600 rounded transition-colors"
                title="Delete address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;