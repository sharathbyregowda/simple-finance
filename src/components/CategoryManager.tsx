import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Settings, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { ExpenseCategory } from '../types';
import './Dashboard.css';

const CategoryManager: React.FC = () => {
    const { addCategory, addSubcategory, updateCategory, deleteCategory, getCategoryHierarchy } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState<ExpenseCategory>(ExpenseCategory.NEEDS);
    const [icon, setIcon] = useState('📌');

    // Subcategory state
    const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
    const [subName, setSubName] = useState('');
    const [subIcon, setSubIcon] = useState('📄');
    const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
    const [customSubName, setCustomSubName] = useState('');

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        addCategory({
            name,
            type,
            icon,
            color: type === ExpenseCategory.NEEDS ? '#F59E0B' : '#A855F7',
        });

        setName('');
        setType(ExpenseCategory.NEEDS);
        setIcon('📌');
        setIsOpen(false);
    };

    const handleAddSubcategory = (parentId: string) => {
        const finalName = isCustomSubcategory ? customSubName : subName;
        if (!finalName) return;

        addSubcategory(parentId, {
            name: finalName,
            type: ExpenseCategory.NEEDS, // Will be overridden by parent's type
            icon: subIcon,
        });

        setSubName('');
        setSubIcon('📄');
        setIsCustomSubcategory(false);
        setCustomSubName('');
        setAddingSubTo(null);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: string, hasSubcategories: boolean) => {
        if (isDeleting) {
            console.log('Already deleting, ignoring click');
            return;
        }

        console.log('handleDelete called for id:', id);
        setIsDeleting(true);

        const message = hasSubcategories
            ? 'This will delete the category and all its subcategories. Are you sure?'
            : 'Are you sure you want to delete this category?';

        console.log('About to show confirm dialog');
        console.log('Message:', message);

        try {
            const confirmed = window.confirm(message);
            console.log('Confirm result:', confirmed);

            if (confirmed) {
                console.log('User confirmed, calling deleteCategory');
                deleteCategory(id);
            } else {
                console.log('User cancelled');
            }
        } catch (error) {
            console.error('Error showing confirm dialog:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (category: { id: string; name: string; icon?: string }) => {
        setEditingId(category.id);
        setEditName(category.name);
        setEditIcon(category.icon || '📌');
        setShowEmojiPicker(false);
        setAddingSubTo(null); // Close any open subcategory forms
    };

    const handleSaveEdit = (id: string) => {
        if (!editName.trim()) return;

        updateCategory(id, {
            name: editName.trim(),
            icon: editIcon,
        });
        setEditingId(null);
        setShowEmojiPicker(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setShowEmojiPicker(false);
    };

    const commonEmojis = ['💰', '🏠', '🚗', '🍔', '🎬', '🛒', '💡', '📱', '✈️', '🎨', '🏋️', '📚', '🎮', '☕', '👕', '💊'];

    // Predefined subcategory options by category type
    const subcategoryOptions = {
        [ExpenseCategory.NEEDS]: [
            { name: 'School Fee', icon: '📝' },
            { name: 'School Uniform', icon: '👕' },
            { name: 'Stationery', icon: '📋' },
            { name: 'Textbooks', icon: '📚' },
            { name: 'Tuition', icon: '🎓' },
            { name: 'Daycare', icon: '👶' },
            { name: 'After School Care', icon: '🏫' },
            { name: 'Electricity', icon: '💡' },
            { name: 'Water', icon: '💧' },
            { name: 'Gas', icon: '🔥' },
            { name: 'Internet', icon: '🌐' },
            { name: 'Phone', icon: '📱' },
            { name: 'Fuel', icon: '⛽' },
            { name: 'Public Transport', icon: '🚌' },
            { name: 'Car Maintenance', icon: '🔧' },
            { name: 'Insurance', icon: '🛡️' },
            { name: 'Groceries - Fresh Produce', icon: '🥬' },
            { name: 'Groceries - Meat & Dairy', icon: '🥩' },
            { name: 'Groceries - Pantry', icon: '🥫' },
            { name: 'Household Supplies', icon: '🧹' },
        ],
        [ExpenseCategory.WANTS]: [
            { name: 'Streaming Services', icon: '📺' },
            { name: 'Movies', icon: '🎬' },
            { name: 'Concerts', icon: '🎵' },
            { name: 'Sports Events', icon: '⚽' },
            { name: 'Restaurants', icon: '🍽️' },
            { name: 'Fast Food', icon: '🍔' },
            { name: 'Coffee Shops', icon: '☕' },
            { name: 'Bars & Pubs', icon: '🍺' },
            { name: 'Clothing', icon: '👔' },
            { name: 'Shoes', icon: '👟' },
            { name: 'Accessories', icon: '👜' },
            { name: 'Cosmetics', icon: '💄' },
            { name: 'Gym Membership', icon: '🏋️' },
            { name: 'Sports Equipment', icon: '⚾' },
            { name: 'Hobbies', icon: '🎨' },
            { name: 'Books & Magazines', icon: '📖' },
            { name: 'Flights', icon: '✈️' },
            { name: 'Hotels', icon: '🏨' },
            { name: 'Activities', icon: '🎢' },
            { name: 'Souvenirs', icon: '🎁' },
        ],
        [ExpenseCategory.SAVINGS]: [
            { name: 'Emergency Fund', icon: '🆘' },
            { name: 'Retirement', icon: '👴' },
            { name: 'Education Fund', icon: '🎓' },
            { name: 'House Down Payment', icon: '🏡' },
            { name: 'Car Fund', icon: '🚗' },
            { name: 'Vacation Fund', icon: '🏖️' },
            { name: 'Investment Portfolio', icon: '📈' },
            { name: 'Stocks', icon: '📊' },
            { name: 'Bonds', icon: '💼' },
            { name: 'Crypto', icon: '₿' },
        ],
    };

    const hierarchy = getCategoryHierarchy();

    const renderCategorySection = (sectionType: ExpenseCategory, title: string) => {
        const sectionCategories = hierarchy.filter((h) => h.category.type === sectionType);

        return (
            <div className="category-section">
                <h4 className="category-section-title">{title}</h4>
                <div className="category-items">
                    {sectionCategories.map(({ category, subcategories }) => (
                        <div key={category.id} className="category-tree-item">
                            {/* Parent Category */}
                            <div className="category-item category-parent">
                                {editingId === category.id ? (
                                    <div className="category-edit-form">
                                        <div className="category-edit-row">
                                            <button
                                                type="button"
                                                className="emoji-picker-trigger"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            >
                                                {editIcon}
                                            </button>
                                            <input
                                                type="text"
                                                className="input input-sm"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Category name"
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                        {showEmojiPicker && (
                                            <div className="emoji-picker-small">
                                                {commonEmojis.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        className={`emoji-button ${editIcon === emoji ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setEditIcon(emoji);
                                                            setShowEmojiPicker(false);
                                                        }}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="category-edit-actions">
                                            <button
                                                type="button"
                                                className="btn-icon btn-icon-success"
                                                onClick={() => handleSaveEdit(category.id)}
                                                title="Save changes"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={handleCancelEdit}
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="category-item-info">
                                            <span className="category-icon">{category.icon}</span>
                                            <span className="category-name">{category.name}</span>
                                            {subcategories.length > 0 && (
                                                <span className="subcategory-count">({subcategories.length})</span>
                                            )}
                                        </div>
                                        <div className="category-actions">
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => handleEdit(category)}
                                                title="Edit category"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => setAddingSubTo(addingSubTo === category.id ? null : category.id)}
                                                title="Add subcategory"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(category.id, subcategories.length > 0);
                                                }}
                                                title="Delete category"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Add Subcategory Form */}
                            {addingSubTo === category.id && (
                                <div className="subcategory-form">
                                    <div className="form-group" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <label className="label" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                            Select Subcategory
                                        </label>
                                        <select
                                            className="select"
                                            value={isCustomSubcategory ? 'custom' : subName}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') {
                                                    setIsCustomSubcategory(true);
                                                    setSubName('');
                                                    setSubIcon('📄');
                                                } else {
                                                    setIsCustomSubcategory(false);
                                                    const selectedOption = subcategoryOptions[category.type].find(
                                                        opt => opt.name === e.target.value
                                                    );
                                                    setSubName(e.target.value);
                                                    if (selectedOption) {
                                                        setSubIcon(selectedOption.icon);
                                                    }
                                                }
                                            }}
                                        >
                                            <option value="">Choose a subcategory...</option>
                                            {subcategoryOptions[category.type].map((option) => (
                                                <option key={option.name} value={option.name}>
                                                    {option.icon} {option.name}
                                                </option>
                                            ))}
                                            <option value="custom">✏️ Custom (Enter your own)</option>
                                        </select>
                                        {!isCustomSubcategory && (
                                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                                                💡 Select from predefined options or choose "Custom" to create your own
                                            </p>
                                        )}
                                    </div>

                                    {/* Custom subcategory input */}
                                    {isCustomSubcategory && (
                                        <div className="form-group" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            <label className="label" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                                Custom Subcategory Name
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Enter custom subcategory name"
                                                value={customSubName}
                                                onChange={(e) => setCustomSubName(e.target.value)}
                                            />
                                            <div className="emoji-picker-small" style={{ marginTop: 'var(--spacing-sm)' }}>
                                                {['📄', '📝', '📋', '📌', '🔖', '🏷️', '📎', '🔗', '✨', '⭐', '💫', '🎯'].map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        className={`emoji-button ${subIcon === emoji ? 'selected' : ''}`}
                                                        onClick={() => setSubIcon(emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-sm">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAddSubcategory(category.id)}
                                            disabled={isCustomSubcategory ? !customSubName : !subName}
                                        >
                                            Add
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setAddingSubTo(null);
                                                setSubName('');
                                                setSubIcon('📄');
                                                setIsCustomSubcategory(false);
                                                setCustomSubName('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Subcategories */}
                            {subcategories.length > 0 && (
                                <div className="subcategory-list">
                                    {subcategories.map((sub) => (
                                        <div key={sub.id} className="category-item category-subcategory">
                                            {editingId === sub.id ? (
                                                <div className="category-edit-form">
                                                    <div className="category-edit-row">
                                                        <button
                                                            type="button"
                                                            className="emoji-picker-trigger"
                                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        >
                                                            {editIcon}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            className="input input-sm"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            placeholder="Subcategory name"
                                                            style={{ flex: 1 }}
                                                        />
                                                    </div>
                                                    {showEmojiPicker && (
                                                        <div className="emoji-picker-small">
                                                            {commonEmojis.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    type="button"
                                                                    className={`emoji-button ${editIcon === emoji ? 'selected' : ''}`}
                                                                    onClick={() => {
                                                                        setEditIcon(emoji);
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="category-edit-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-icon btn-icon-success"
                                                            onClick={() => handleSaveEdit(sub.id)}
                                                            title="Save changes"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-icon"
                                                            onClick={handleCancelEdit}
                                                            title="Cancel"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="category-item-info">
                                                        <ChevronRight size={14} className="subcategory-arrow" />
                                                        <span className="category-icon">{sub.icon}</span>
                                                        <span className="category-name">{sub.name}</span>
                                                    </div>
                                                    <div className="category-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-icon"
                                                            onClick={() => handleEdit(sub)}
                                                            title="Edit subcategory"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(sub.id, false);
                                                            }}
                                                            title="Delete subcategory"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="card category-manager-card">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex items-center gap-sm">
                    <Settings size={20} />
                    <h3>Manage Categories</h3>
                </div>
                <button className="btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="animate-fade-in" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="form-group">
                        <label className="label">Category Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Child Care, Transportation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Type</label>
                        <select
                            className="select"
                            value={type}
                            onChange={(e) => setType(e.target.value as ExpenseCategory)}
                        >
                            <option value={ExpenseCategory.NEEDS}>Need (Essential)</option>
                            <option value={ExpenseCategory.WANTS}>Want (Discretionary)</option>
                        </select>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                            Choose whether this expense is essential (Need) or discretionary (Want)
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="label">Icon (Optional)</label>
                        <div className="emoji-picker">
                            {commonEmojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`emoji-button ${icon === emoji ? 'selected' : ''}`}
                                    onClick={() => setIcon(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-sm">
                        <button type="submit" className="btn btn-primary">
                            Add Category
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="category-list">
                {renderCategorySection(ExpenseCategory.NEEDS, 'Needs (50%)')}
                {renderCategorySection(ExpenseCategory.WANTS, 'Wants (30%)')}
                {renderCategorySection(ExpenseCategory.SAVINGS, 'Savings (20%)')}
            </div>
        </div>
    );
};

export default CategoryManager;
