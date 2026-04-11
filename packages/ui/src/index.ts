/**
 * @mfc/ui - Reusable UI Component Library
 * 
 * A collection of accessible, reusable React components for the MFC BillDesk application.
 * 
 * @package @mfc/ui
 * @version 1.0.0
 */

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export {
    Form,
    useFormContext,
    Input,
    Select,
    Autocomplete,
    Checkbox,
    Radio,
    Textarea,
    type FormProps,
    type FormContextValue,
    type InputProps,
    type SelectProps,
    type SelectOption,
    type AutocompleteProps,
    type AutocompleteOption,
    type CheckboxProps,
    type RadioProps,
    type RadioOption,
    type TextareaProps,
} from './components/forms';

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================

export {
    ToastProvider,
    useToast,
    Spinner,
    LoadingOverlay,
    Skeleton,
    SkeletonGroup,
    LoadingState,
    ErrorBoundary,
    ErrorBoundaryWrapper,
    ConfirmProvider,
    useConfirm,
    type Toast,
    type ToastType,
    type ToastContextValue,
    type SpinnerProps,
    type LoadingOverlayProps,
    type SkeletonProps,
    type SkeletonGroupProps,
    type LoadingStateProps,
    type ErrorBoundaryProps,
    type ConfirmOptions,
    type ConfirmContextValue,
} from './components/feedback';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export {
    Card,
    CardSection,
    Modal,
    useModal,
    Drawer,
    useDrawer,
    EmptyState,
    type CardProps,
    type CardSectionProps,
    type ModalProps,
    type DrawerProps,
    type EmptyStateProps,
} from './components/layout';

// ============================================================================
// ERROR COMPONENTS
// ============================================================================

export {
    ErrorMessage,
    ErrorBoundary as ErrorBoundaryComponent,
    type ErrorMessageProps,
} from './ErrorMessage';

export {
    Toast,
    ToastContainer,
    useToasts,
    type ToastProps,
    type ToastContainerProps,
    type ToastType,
} from './ErrorToast';
