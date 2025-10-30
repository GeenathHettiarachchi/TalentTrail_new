import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(Swal);

const SweetAlert = {
  confirm: async ({ title = 'Are you sure?', text = '', confirmButtonText = 'Yes', cancelButtonText = 'Cancel', icon = 'question' } = {}) => {
    const result = await ReactSwal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        content: 'swal2-content-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    return result.isConfirmed;
  },

  alert: async ({ title = '', text = '', icon = 'info', confirmButtonText = 'OK' } = {}) => {
    await ReactSwal.fire({
      title,
      text,
      icon,
      confirmButtonText,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        content: 'swal2-content-custom',
        confirmButton: 'swal2-confirm-custom'
      }
    });
  }
};

export default SweetAlert;
