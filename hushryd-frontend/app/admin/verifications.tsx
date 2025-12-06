import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable, { TableColumn } from '../../components/admin/DataTable';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../../constants/Design';

// Mock data
const mockVerifications = [
  { id: 'V001', userId: 'U123', userName: 'John Doe', type: 'vehicle', documentType: 'registration', status: 'pending', submittedDate: '2024-10-11', userRole: 'driver', details: 'Toyota Prius - DL5CAP1234' },
  { id: 'V002', userId: 'U124', userName: 'Sarah Smith', type: 'license', documentType: 'drivers_license', status: 'pending', submittedDate: '2024-10-11', userRole: 'driver', details: 'DL-123456789' },
  { id: 'V003', userId: 'U125', userName: 'Mike Johnson', type: 'vehicle', documentType: 'insurance', status: 'approved', submittedDate: '2024-10-10', userRole: 'customer', details: 'Mercedes E-Class - HR26AB1234' },
  { id: 'V004', userId: 'U126', userName: 'Emma Wilson', type: 'user', documentType: 'id_card', status: 'pending', submittedDate: '2024-10-10', userRole: 'passenger', details: 'Aadhaar Card' },
  { id: 'V005', userId: 'U127', userName: 'David Lee', type: 'vehicle', documentType: 'registration', status: 'rejected', submittedDate: '2024-10-09', userRole: 'driver', details: 'Honda City - MH01AB1234' },
];

export default function VerificationsPage() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const vehicleDocumentSections = [
    {
      title: 'Vehicle Ownership Documents',
      items: [
        { label: 'Registration Certificate (RC)', status: 'approved' },
        { label: 'Insurance Policy', status: 'in-review' },
        { label: 'Pollution Certificate (PUC)', status: 'approved' },
        { label: 'Fitness Certificate', status: 'pending' },
      ],
    },
    {
      title: 'Vehicle Photographs',
      items: [
        { label: 'Front View', status: 'approved' },
        { label: 'Rear View', status: 'approved' },
        { label: 'Dashboard & Odometer', status: 'pending' },
        { label: 'Chassis Number', status: 'in-review' },
      ],
    },
  ];

  const vehicleActiveFiles: FileItem[] = [
    { name: 'Vehicle_RC_Front.pdf', created: '15-10-2025 10:55:24', status: 'approved' },
    { name: 'Insurance_Certificate_2025.pdf', created: '15-10-2025 10:55:35', status: 'in-review' },
    { name: 'PUC_Certificate.pdf', created: '15-10-2025 10:55:42', status: 'approved' },
  ];

  const vehicleExpiredFiles: FileItem[] = [
    { name: 'Insurance_2024.pdf', created: '22-06-2024 17:52:29', status: 'expired' },
    { name: 'Fitness_Certificate_2024.pdf', created: '22-06-2024 17:52:39', status: 'expired' },
  ];


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return '🚗';
      case 'license': return '🪪';
      case 'user': return '👤';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vehicle': return '#3b82f6';
      case 'license': return '#8b5cf6';
      case 'user': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleReview = (verification: any) => {
    setSelectedVerification(verification);
  };

  const handleApprove = () => {
    Alert.alert('Success', `Verification ${selectedVerification?.id} has been approved!`);
    setSelectedVerification(null);
  };

  const handleReject = () => {
    Alert.alert('Rejected', `Verification ${selectedVerification?.id} has been rejected.`);
    setSelectedVerification(null);
  };

  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Request ID',
      width: 100,
      render: (value) => (
        <Text style={[styles.requestId, { color: colors.primary }]}>{value}</Text>
      ),
    },
    {
      key: 'userName',
      label: 'User',
      width: 180,
      render: (value, row) => (
        <View style={styles.userCell}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.avatarText}>{value[0]}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>{row.userRole}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: 130,
      render: (value) => (
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(value) + '20' }]}>
          <Text style={styles.typeBadgeIcon}>{getTypeIcon(value)}</Text>
          <Text style={[styles.typeBadgeText, { color: getTypeColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      width: 200,
    },
    {
      key: 'status',
      label: 'Status',
      width: 110,
      render: (value) => (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(value) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(value) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(value) }]}>{value}</Text>
        </View>
      ),
    },
    {
      key: 'submittedDate',
      label: 'Submitted',
      width: 120,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 120,
      render: (_, row) => (
        row.status === 'pending' ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleReview(row)}
          >
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Review</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            {row.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
          </Text>
        )
      ),
    },
  ];

  const filteredVerifications = mockVerifications.filter(v => 
    filter === 'all' || v.status === filter
  );

  const pendingCount = mockVerifications.filter(v => v.status === 'pending').length;
  const approvedCount = mockVerifications.filter(v => v.status === 'approved').length;
  const rejectedCount = mockVerifications.filter(v => v.status === 'rejected').length;

  const selectedForDisplay = useMemo(() => {
    if (!selectedVerification) return null;
    const fresh = filteredVerifications.find(v => v.id === selectedVerification.id);
    return fresh || selectedVerification;
  }, [filteredVerifications, selectedVerification]);

  return (
    <AdminLayout title="Verifications" currentPage="verifications">
      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            <View style={styles.pageHeader}>
              <View>
                <Text style={[styles.pageTitle, { color: colors.text }]}>Verifications</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                  Review and approve user verifications
                </Text>
              </View>
            </View>

            {/* Verification Stats */}
            <View style={styles.statsContainer}>
              <StatCard icon="⏳" label="Pending" value={pendingCount.toString()} color="#f59e0b" />
              <StatCard icon="✅" label="Approved" value={approvedCount.toString()} color="#10b981" />
              <StatCard icon="✗" label="Rejected" value={rejectedCount.toString()} color="#ef4444" />
              <StatCard icon="📊" label="Total" value={mockVerifications.length.toString()} color="#3b82f6" />
            </View>

            {/* Filters */}
            <View style={[styles.filtersCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.small]}>
              <View style={styles.filterButtons}>
                <FilterButton label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                <FilterButton label="Pending" active={filter === 'pending'} onPress={() => setFilter('pending')} />
                <FilterButton label="Approved" active={filter === 'approved'} onPress={() => setFilter('approved')} />
                <FilterButton label="Rejected" active={filter === 'rejected'} onPress={() => setFilter('rejected')} />
              </View>
            </View>

            {isSmallScreen ? (
              <View style={styles.mobileList}>
                {filteredVerifications.map((verification) => {
                  const isActive = selectedVerification?.id === verification.id;
                  return (
                    <TouchableOpacity
                      key={verification.id}
                      style={[
                        styles.mobileCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        isActive && styles.mobileCardActive,
                      ]}
                      onPress={() => handleReview(verification)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.mobileCardHeader}>
                        <Text style={[styles.mobileCardTitle, { color: colors.text }]}>{verification.userName}</Text>
                        <StatusPill status={verification.status} />
                      </View>
                      <Text style={[styles.mobileCardSubtitle, { color: colors.textSecondary }]}>{verification.details}</Text>
                      <View style={styles.mobileCardMetaRow}>
                        <Text style={[styles.mobileCardMeta, { color: colors.textSecondary }]}>ID: {verification.id}</Text>
                        <Text style={[styles.mobileCardMeta, { color: colors.textSecondary }]}>{verification.submittedDate}</Text>
                      </View>
                      <View style={styles.mobileCardFooter}>
                        <Text style={[styles.mobileCardMeta, { color: colors.textSecondary }]}>Type: {verification.type}</Text>
                        <Text style={[styles.mobileCardAction, { color: colors.primary }]}>Tap to review</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.tableContainer}>
                <DataTable
                  columns={columns}
                  data={filteredVerifications}
                  onRowPress={(row) => console.log('Verification clicked:', row)}
                  emptyMessage="No verifications found"
                />
              </View>
            )}

            {selectedForDisplay && (
              <View style={[styles.detailPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.large]}>
                <View style={styles.detailPanelHeader}>
                  <View>
                    <Text style={[styles.detailPanelTitle, { color: colors.text }]}>Verification Details</Text>
                    <Text style={[styles.detailPanelSubtitle, { color: colors.textSecondary }]}>
                      Review the uploaded vehicle documents and approve or reject the request.
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedVerification(null)}>
                    <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>Close ✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={[styles.reviewScroll, isSmallScreen && styles.reviewScrollMobile]} showsVerticalScrollIndicator={false}>
                  <View style={styles.verificationDetails}>
                    <DetailRow label="Request ID" value={selectedForDisplay.id} />
                    <DetailRow label="User" value={selectedForDisplay.userName} />
                    <DetailRow label="User Role" value={selectedForDisplay.userRole} />
                    <DetailRow label="Verification Type" value={selectedForDisplay.type} />
                    <DetailRow label="Document" value={selectedForDisplay.documentType} />
                    <DetailRow label="Details" value={selectedForDisplay.details} />
                    <DetailRow label="Submitted" value={selectedForDisplay.submittedDate} />
                  </View>

                  <View style={[styles.reviewCard, { borderColor: colors.border }]}>
                    <Text style={[styles.reviewCardTitle, { color: colors.text }]}>Review Comments</Text>
                    <View style={styles.commentRow}>
                      <Text style={[styles.commentAuthor, { color: colors.primary }]}>Ravi Teja</Text>
                      <Text style={[styles.commentTime, { color: colors.textSecondary }]}>23-10-2025 17:45</Text>
                    </View>
                    <Text style={[styles.commentBody, { color: colors.textSecondary }]}>Customer does not have cheques</Text>
                  </View>

                  {selectedForDisplay.type === 'vehicle' ? (
                    <>
                      {vehicleDocumentSections.map((section) => (
                        <View key={section.title} style={[styles.sectionCard, { borderColor: colors.border }]}>
                          <Text style={[styles.sectionHeading, { color: colors.text }]}>{section.title}</Text>
                          {section.items.map((item) => (
                            <View key={item.label} style={styles.checklistRow}>
                              <Text style={[styles.checklistLabel, { color: colors.text }]}>{item.label}</Text>
                              <StatusPill status={item.status} />
                            </View>
                          ))}
                        </View>
                      ))}

                      <View style={[styles.sectionCard, { borderColor: colors.border }]}>
                        <Text style={[styles.sectionHeading, { color: colors.text }]}>Document Attachments</Text>
                        <Text style={[styles.fileSectionTitle, { color: colors.textSecondary }]}>Active Files</Text>
                        {vehicleActiveFiles.map((file) => (
                          <FileRow key={file.name} file={file} />
                        ))}
                        <Text style={[styles.fileSectionTitle, { color: colors.textSecondary, marginTop: Spacing.medium }]}>Expired Files</Text>
                        {vehicleExpiredFiles.map((file) => (
                          <FileRow key={file.name} file={file} />
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={[styles.sectionCard, { borderColor: colors.border }]}>
                      <Text style={[styles.sectionHeading, { color: colors.text }]}>Document Review</Text>
                      <Text style={[styles.commentBody, { color: colors.textSecondary }]}>
                        Detailed document verification is currently available for vehicle submissions. Please review the uploaded files above.
                      </Text>
                    </View>
                  )}

                  <View style={[styles.documentPreview, { backgroundColor: colors.lightGray, borderColor: colors.border }]}>
                    <Text style={styles.documentIcon}>📄</Text>
                    <Text style={[styles.documentText, { color: colors.text }]}>Document Preview</Text>
                    <Text style={[styles.documentSubtext, { color: colors.textSecondary }]}>Click to open the full resolution file</Text>
                  </View>
                </ScrollView>

                <View style={[styles.inlineActions, isSmallScreen && styles.inlineActionsMobile]}>
                  <TouchableOpacity
                    style={[styles.inlineActionButton, { backgroundColor: '#ef4444' }]}
                    onPress={handleReject}
                  >
                    <Text style={[styles.inlineActionText, { color: '#FFFFFF' }]}>✗ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineActionButton, { backgroundColor: '#10b981' }]}
                    onPress={handleApprove}
                  >
                    <Text style={[styles.inlineActionText, { color: '#FFFFFF' }]}>✓ Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
      </ScrollView>
    </AdminLayout>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.small]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterButton({ label, active, onPress }: FilterButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: active ? colors.primary : colors.lightGray }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, { color: active ? '#FFFFFF' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface StatusPillProps {
  status: 'approved' | 'pending' | 'in-review' | 'rejected' | 'expired';
}

function StatusPill({ status }: StatusPillProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const colorMap = {
    approved: '#10b981',
    pending: '#f59e0b',
    'in-review': '#3b82f6',
    rejected: '#ef4444',
  } as const;

  const background = colorMap[status] + '20';
  return (
    <View style={[styles.statusPill, { backgroundColor: background }]}> 
      <Text style={[styles.statusPillText, { color: colorMap[status] }]}>{status.replace('-', ' ')}</Text>
    </View>
  );
}

interface FileItem {
  name: string;
  created: string;
  status: 'approved' | 'in-review' | 'pending' | 'rejected' | 'expired';
}

interface FileRowProps {
  file: FileItem;
}

function FileRow({ file }: FileRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const statusColor = {
    approved: '#10b981',
    'in-review': '#f59e0b',
    pending: '#3b82f6',
    rejected: '#ef4444',
    expired: '#6b7280', // Added expired status color
  }[file.status];

  return (
    <View style={[styles.fileRow, { borderBottomColor: colors.border }]}> 
      <View style={styles.fileMeta}>
        <Text style={[styles.fileName, { color: colors.text }]}>{file.name}</Text>
        <Text style={[styles.fileInfo, { color: colors.textSecondary }]}>Created: {file.created}</Text>
      </View>
      <View style={[styles.fileStatusBadge, { backgroundColor: statusColor + '20' }]}> 
        <Text style={[styles.fileStatusText, { color: statusColor }]}>{file.status.replace('-', ' ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, padding: Spacing.medium },
  backIcon: { fontSize: FontSizes.large },
  backText: { fontSize: FontSizes.medium, fontWeight: '600' },
  main: { flex: 1 },
  mainContent: { padding: Spacing.large },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.large },
  pageTitle: { fontSize: FontSizes.extraLarge * 1.2, fontWeight: '800' },
  pageSubtitle: { fontSize: FontSizes.medium, marginTop: 4 },
  statsContainer: { flexDirection: 'row', gap: Spacing.medium, marginBottom: Spacing.large },
  statCard: { flex: 1, padding: Spacing.medium, borderRadius: BorderRadius.medium, borderWidth: 1, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: BorderRadius.small, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.small },
  statIconText: { fontSize: FontSizes.large },
  statValue: { fontSize: FontSizes.large, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: FontSizes.tiny },
  filtersCard: { padding: Spacing.medium, borderRadius: BorderRadius.medium, borderWidth: 1, marginBottom: Spacing.large },
  filterButtons: { flexDirection: 'row', gap: Spacing.small },
  filterButton: { paddingHorizontal: Spacing.medium, paddingVertical: Spacing.small, borderRadius: BorderRadius.small },
  filterButtonText: { fontSize: FontSizes.small, fontWeight: '600' },
  tableContainer: { marginBottom: Spacing.large },
  requestId: { fontSize: FontSizes.small, fontWeight: '700' },
  userCell: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSizes.small, fontWeight: '700' },
  userName: { fontSize: FontSizes.small, fontWeight: '700' },
  userRole: { fontSize: FontSizes.tiny, textTransform: 'capitalize' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.tiny, paddingHorizontal: Spacing.small, paddingVertical: 4, borderRadius: BorderRadius.small, alignSelf: 'flex-start' },
  typeBadgeIcon: { fontSize: FontSizes.tiny },
  typeBadgeText: { fontSize: FontSizes.tiny, fontWeight: '700', textTransform: 'capitalize' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.tiny, paddingHorizontal: Spacing.small, paddingVertical: 4, borderRadius: BorderRadius.small, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.tiny, fontWeight: '700', textTransform: 'capitalize' },
  actionButton: { paddingHorizontal: Spacing.small, paddingVertical: 4, borderRadius: BorderRadius.small },
  actionButtonText: { fontSize: FontSizes.tiny, fontWeight: '700' },
  statusLabel: { fontSize: FontSizes.tiny },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.large },
  modalContent: { width: '100%', maxWidth: 600, borderRadius: BorderRadius.large, padding: Spacing.extraLarge },
  modalTitle: { fontSize: FontSizes.extraLarge, fontWeight: '800', marginBottom: Spacing.large, textAlign: 'center' },
  reviewScroll: { paddingBottom: Spacing.large, gap: Spacing.large },
  verificationDetails: { gap: Spacing.small, marginBottom: Spacing.large },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: FontSizes.small, fontWeight: '600' },
  detailValue: { fontSize: FontSizes.small, fontWeight: '700', textTransform: 'capitalize' },
  documentPreview: { marginTop: Spacing.medium, padding: Spacing.extraLarge, borderRadius: BorderRadius.medium, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center' },
  documentIcon: { fontSize: FontSizes.extraLarge * 2, marginBottom: Spacing.small },
  documentText: { fontSize: FontSizes.medium, fontWeight: '700', marginBottom: 4 },
  documentSubtext: { fontSize: FontSizes.small },
  statusCardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.medium },
  reviewCard: { padding: Spacing.medium, borderWidth: 1, borderRadius: BorderRadius.medium, gap: Spacing.small },
  reviewCardTitle: { fontSize: FontSizes.medium, fontWeight: '700' },
  commentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { fontSize: FontSizes.small, fontWeight: '700' },
  commentTime: { fontSize: FontSizes.tiny },
  commentBody: { fontSize: FontSizes.small },
  analysisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.medium },
  sectionCard: { padding: Spacing.medium, borderWidth: 1, borderRadius: BorderRadius.medium, gap: Spacing.small },
  sectionHeading: { fontSize: FontSizes.medium, fontWeight: '700' },
  checklistRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.tiny },
  checklistLabel: { fontSize: FontSizes.small, flex: 1, marginRight: Spacing.small },
  statusPill: { paddingHorizontal: Spacing.medium, paddingVertical: Spacing.tiny, borderRadius: BorderRadius.round },
  statusPillText: { fontSize: FontSizes.tiny, fontWeight: '700', textTransform: 'capitalize' },
  fileList: { marginTop: Spacing.medium, gap: Spacing.small },
  fileSectionTitle: { fontSize: FontSizes.tiny, fontWeight: '700', letterSpacing: 0.4 },
  fileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.tiny, borderBottomWidth: StyleSheet.hairlineWidth },
  fileMeta: { flexDirection: 'column', flex: 1, gap: 2 },
  fileName: { fontSize: FontSizes.small, fontWeight: '600' },
  fileInfo: { fontSize: FontSizes.tiny },
  fileStatusBadge: { paddingHorizontal: Spacing.small, paddingVertical: 2, borderRadius: BorderRadius.small },
  fileStatusText: { fontSize: FontSizes.tiny, fontWeight: '700', textTransform: 'capitalize' },
  detailPanel: { borderWidth: 1, borderRadius: BorderRadius.large, marginTop: Spacing.large, padding: Spacing.large, gap: Spacing.large },
  detailPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.medium },
  detailPanelTitle: { fontSize: FontSizes.extraLarge, fontWeight: '800' },
  detailPanelSubtitle: { fontSize: FontSizes.sm, marginTop: Spacing.tiny },
  inlineActions: { flexDirection: 'row', gap: Spacing.medium },
  inlineActionsMobile: { flexDirection: 'column' },
  inlineActionButton: { flex: 1, padding: Spacing.medium, borderRadius: BorderRadius.medium, alignItems: 'center' },
  inlineActionText: { fontSize: FontSizes.small, fontWeight: '700' },
  mobileList: { gap: Spacing.medium },
  mobileCard: { borderWidth: 1, borderRadius: BorderRadius.large, padding: Spacing.large, gap: Spacing.small },
  mobileCardActive: { borderColor: '#3b82f6' },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileCardTitle: { fontSize: FontSizes.lg, fontWeight: '700' },
  mobileCardSubtitle: { fontSize: FontSizes.sm, lineHeight: FontSizes.sm * 1.4 },
  mobileCardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.small },
  mobileCardMeta: { fontSize: FontSizes.tiny },
  mobileCardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.small, alignItems: 'center' },
  mobileCardAction: { fontSize: FontSizes.tiny, fontWeight: '700' },
  reviewScrollMobile: { paddingBottom: Spacing.huge },
});

