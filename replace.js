const fs = require('fs');
const file = 'c:/Users/dell/Downloads/adarsh_dham/frontend/src/components/admin/ReAllocateModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import { toast } from 'react-toastify';",
    "import { toast } from 'react-toastify';\nimport { useTranslation } from '../../hooks/useTranslation';"
);

content = content.replace(
    "const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false }) => {",
    "const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false }) => {\n    const t = useTranslation();"
);

content = content.replace(
    'placeholder="Search..."',
    'placeholder={t.admin.reAllocateModal.searchPlaceholder}'
);
content = content.replace(
    '<li className="p-2 text-sm text-gray-500 italic">No options found.</li>',
    '<li className="p-2 text-sm text-gray-500 italic">{t.admin.reAllocateModal.noOptions}</li>'
);

content = content.replace(
    "const ReAllocateModal = ({ isOpen, onClose, booking, buildings, rooms, people, onUpdate, onShowRoomDetails }) => {\n    const [allocations, setAllocations] = useState([]);",
    "const ReAllocateModal = ({ isOpen, onClose, booking, buildings, rooms, people, onUpdate, onShowRoomDetails }) => {\n    const t = useTranslation();\n    const [allocations, setAllocations] = useState([]);"
);

content = content.replace(
    "label: `Room ${r.roomNumber} (${availableBedsCount} available)`",
    "label: `Room ${r.roomNumber} (${availableBedsCount} ${t.admin.reAllocateModal.available})`"
);

content = content.replace(
    "const label = isOccupied ? `${bed.name} (Occupied/Selected)` : bed.name;",
    "const label = isOccupied ? `${bed.name} ${t.admin.reAllocateModal.occupiedSelected}` : bed.name;"
);

content = content.replace(
    "toast.error(`Please select a bed for: ${missingBeds.join(', ')}`);",
    "toast.error(`${t.admin.reAllocateModal.pleaseSelectBed} ${missingBeds.join(', ')}`);"
);

content = content.replace(
    "toast.success('Allocations updated successfully');",
    "toast.success(t.admin.reAllocateModal.successMsg);"
);

content = content.replace(
    "toast.error(err.response?.data?.message || 'Failed to update allocations');",
    "toast.error(err.response?.data?.message || t.admin.reAllocateModal.failMsg);"
);

content = content.replace(
    "Re-Allocate Beds - {booking.bookingNumber}",
    "{t.admin.reAllocateModal.title} - {booking.bookingNumber}"
);

content = content.replace(
    "{person?.name || `Person ${index + 1}`}",
    "{person?.name || `${t.admin.reAllocateModal.person} ${index + 1}`}"
);

content = content.replace(
    "Child ≤4",
    "{t.admin.manageAllocations.childLabel}"
);

content = content.replace(
    "Stay:",
    "{t.admin.reAllocateModal.stay}:"
);

content = content.replace(
    "No bed allocation needed for young child",
    "{t.admin.manageAllocations.noBedNeededTitle}"
);

content = content.replace(
    'placeholder="Select Building"',
    'placeholder={t.admin.reAllocateModal.selectBuilding}'
);

content = content.replace(
    'placeholder="Select Room"',
    'placeholder={t.admin.reAllocateModal.selectRoom}'
);

content = content.replace(
    'placeholder="Select Bed"',
    'placeholder={t.admin.reAllocateModal.selectBed}'
);

content = content.replace(
    "Cancel</Button>",
    "{t.common.cancel}</Button>"
);

content = content.replace(
    "{submitting ? 'Saving...' : <><FaSave className=\"inline mr-2\" /> Save Allocations</>}",
    "{submitting ? t.admin.reAllocateModal.saving : <><FaSave className=\"inline mr-2\" /> {t.admin.reAllocateModal.saveAllocations}</>}"
);

fs.writeFileSync(file, content);
console.log('done');
