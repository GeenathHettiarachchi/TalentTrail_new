import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SweetAlert from '../Common/SweetAlert';
import styles from '../../pages/Developer/Developer.module.css';

const DeveloperReport = ({ interns = [] }) => {
  const generateReport = async () => {
    try {
      const doc = new jsPDF();

      const tableColumn = [
        'No',
        'Intern Code',
        'Name',
        'Email',
        'Mobile Number',
        'End Date',
        'Languages & Frameworks',
        'Projects',
      ];

      const tableRows = interns.map((intern, idx) => [
        idx + 1,
        intern.internCode || '-',
        intern.name || '-',
        intern.email || '-',
        intern.mobileNumber || '-',
        intern.trainingEndDate ? new Date(intern.trainingEndDate).toLocaleDateString() : '-',
        Array.isArray(intern.languagesAndFrameworks) ? intern.languagesAndFrameworks.join(', ') : (intern.languagesAndFrameworks || '-'),
        Array.isArray(intern.projects) ? intern.projects.join(', ') : (intern.projects || '-'),
      ]);

      const now = new Date();
      const headerDate = now.toLocaleString();
      const fileDate = now.toISOString().slice(0, 10);

      // Header
      doc.setFontSize(18);
      doc.text('Developer Interns Report', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated: ${headerDate}`, 105, 22, { align: 'center' });

      // Table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
      });

      doc.save(`Developer-Interns-Report_${fileDate}.pdf`);

      await SweetAlert.alert({
        title: 'Report generated',
        text: 'The Developer interns report was generated and downloaded.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error('Error generating Developer report', err);
      await SweetAlert.alert({
        title: 'Error',
        text: 'Failed to generate report. Check console for details.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <button
      type="button"
      className={styles.primaryBtn}
      onClick={generateReport}
    >
      Generate Report
    </button>
  );
};

export default DeveloperReport;
