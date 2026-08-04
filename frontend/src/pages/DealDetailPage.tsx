import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getDeal, addDealUser, removeDealUser, listDealUsers, DealUser, updateDeal, deleteDeal } from '../services/deals';
import { listDocuments, uploadDocument, deleteAllDocuments, deleteDocument, updateDocument } from '../services/documents';
import { getRiskSummary, listRiskFlags } from '../services/risks';
import { searchDeal, compareDocuments } from '../services/search';
import { listRiskRules, RiskRule, createRiskRule, deleteRiskRule } from '../services/risk_rules';
import { generateReport } from '../services/reports';
import { listBuyers, User } from '../services/users';
import { DealSummary, DocumentRecord, RiskFlag, RiskSummary, SearchResponse, DealReport } from '../types/api';
import useAuth from '../hooks/useAuth';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import DocumentViewer from '../components/DocumentViewer';
import { Trash2, Edit2 } from 'lucide-react';

const DEFAULT_ROLES = ['seller_admin', 'buyer_lawyer', 'buyer_finance', 'buyer_executive'];

export default function DealDetailPage() {
  const params = useParams();
  const dealId = Number(params.dealId);
  const navigate = useNavigate();
  
  const [deal, setDeal] = useState<DealSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [riskRules, setRiskRules] = useState<RiskRule[]>([]);
  
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('general');
  const [allowedRoles, setAllowedRoles] = useState<string[]>(DEFAULT_ROLES);
  
  const [report, setReport] = useState<DealReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [doc1Id, setDoc1Id] = useState<string>('');
  const [doc2Id, setDoc2Id] = useState<string>('');
  const [compareResult, setCompareResult] = useState<string>('');
  const [comparing, setComparing] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  
  // Document Viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<{id: number, filename: string, type: string} | null>(null);

  // Edit Document
  const [editingDoc, setEditingDoc] = useState<{id: number, filename: string, type: string} | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocType, setEditDocType] = useState('');
  const [updatingDoc, setUpdatingDoc] = useState(false);

  // Members
  const [buyers, setBuyers] = useState<User[]>([]);
  const [members, setMembers] = useState<DealUser[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [selectedBuyerRole, setSelectedBuyerRole] = useState('buyer_lawyer');
  const [addingMember, setAddingMember] = useState(false);
  const [updatingDeal, setUpdatingDeal] = useState(false);
  const [dealName, setDealName] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealStatus, setDealStatus] = useState('');
  
  // Risk Rule form
  const [newRuleKey, setNewRuleKey] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState('low');
  const [newRulePatterns, setNewRulePatterns] = useState('');
  const [newRuleInvert, setNewRuleInvert] = useState(false);
  const [newRuleDocTypes, setNewRuleDocTypes] = useState('');
  const [addingRule, setAddingRule] = useState(false);
  
  const { user } = useAuth();

  const rolePlaceholder = useMemo(() => DEFAULT_ROLES.join(', '), []);

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, DocumentRecord[]> = {};
    documents.forEach(doc => {
      const type = (doc.document_type || 'general').toUpperCase();
      if (!groups[type]) groups[type] = [];
      groups[type].push(doc);
    });
    return groups;
  }, [documents]);

  useEffect(() => {
    if (!dealId || Number.isNaN(dealId)) return;
    setLoading(true);
    
    getDeal(dealId)
      .then(async (dealRes) => {
        const dealData = dealRes.data;
        setDeal(dealData);
        setDealName(dealData.name);
        setDealDescription(dealData.description || '');
        setDealStatus(dealData.status);
        try {
          const [documentsRes, riskSummaryRes, riskFlagsRes, buyersRes, membersRes, rulesRes] = await Promise.all([
            listDocuments(dealId),
            getRiskSummary(dealId),
            listRiskFlags(dealId),
            listBuyers(dealData.buyer_company.id),
            listDealUsers(dealId),
            listRiskRules(dealId),
          ]);
          
          setDocuments(documentsRes.data);
          setRiskSummary(riskSummaryRes.data);
          setRiskFlags(riskFlagsRes.data);
          setBuyers(buyersRes.data);
          setMembers(membersRes.data);
          setRiskRules(rulesRes.data);
        } catch (err) {
          setError('Unable to load some deal components.');
        }
      })
      .catch((err: any) => {
        if (err.response?.status === 404) setDeal(null);
        else setError('Unable to load deal details at this time.');
      })
      .finally(() => setLoading(false));
  }, [dealId]);

  if (!params.dealId || Number.isNaN(dealId)) return <Navigate to="/deals" replace />;

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) {
      setError('Please choose a document to upload.');
      return;
    }
    setSubmitting(true);
    setError('');
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('document_type', documentType);
    formData.append('allowed_roles', allowedRoles.join(','));

    try {
      await uploadDocument(dealId, formData);
      const [documentsRes, riskSummaryRes, riskFlagsRes] = await Promise.all([
        listDocuments(dealId),
        getRiskSummary(dealId),
        listRiskFlags(dealId)
      ]);
      setDocuments(documentsRes.data);
      setRiskSummary(riskSummaryRes.data);
      setRiskFlags(riskFlagsRes.data);
      setUploadFile(null);
      setDocumentType('general');
    } catch (uploadError) {
      setError('Upload failed. Please check file type and access permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please type a question for the AI search.');
      return;
    }
    setSearching(true);
    setError('');
    setSearchResult(null);
    try {
      const response = await searchDeal(dealId, searchQuery);
      setSearchResult(response.data);
    } catch {
      setError('AI search failed. Try again later.');
    } finally {
      setSearching(false);
    }
  };
  
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await generateReport(dealId);
      setReport(res.data);
    } catch {
      setError('Failed to generate report.');
    } finally {
      setGeneratingReport(false);
    }
  };
  
  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) return;
    setComparing(true);
    try {
      const res = await compareDocuments(dealId, parseInt(doc1Id), parseInt(doc2Id));
      setCompareResult(res.data.comparison);
    } catch {
      setError('Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBuyerId) return;
    setAddingMember(true);
    try {
      await addDealUser(dealId, parseInt(selectedBuyerId), selectedBuyerRole);
      setSelectedBuyerId('');
      alert('Member added successfully!');
      const res = await listDealUsers(dealId);
      setMembers(res.data);
    } catch {
      setError('Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member from the deal?')) return;
    try {
      await removeDealUser(dealId, userId);
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (err: any) {
      setError(`Failed to remove member: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteDocument = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document forever?')) return;
    try {
      await deleteDocument(dealId, id);
      setDocuments(docs => docs.filter(d => d.id !== id));
      
      const [riskSummaryRes, riskFlagsRes] = await Promise.all([
        getRiskSummary(dealId),
        listRiskFlags(dealId)
      ]);
      setRiskSummary(riskSummaryRes.data);
      setRiskFlags(riskFlagsRes.data);
    } catch (err: any) {
      alert(`Failed to delete document: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleUpdateDocument = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setUpdatingDoc(true);
    try {
      const res = await updateDocument(dealId, editingDoc.id, {
        original_filename: editDocName,
        document_type: editDocType
      });
      setDocuments(docs => docs.map(d => d.id === editingDoc.id ? res.data : d));
      setEditingDoc(null);
    } catch (err: any) {
      alert(`Failed to update document: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdatingDoc(false);
    }
  };

  const handleAddRule = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRuleKey || !newRuleDesc || !newRulePatterns) return;
    
    setAddingRule(true);
    try {
      const docTypes = newRuleDocTypes.split(',').map(s => s.trim()).filter(Boolean);
      const res = await createRiskRule(dealId, {
        rule_key: newRuleKey,
        description: newRuleDesc,
        severity: newRuleSeverity,
        patterns: newRulePatterns.split(',').map(s => s.trim()).filter(Boolean),
        invert: newRuleInvert,
        document_types: docTypes.length > 0 ? docTypes : null,
        is_active: true
      });
      setRiskRules(prev => [res.data, ...prev]);
      setNewRuleKey('');
      setNewRuleDesc('');
      setNewRulePatterns('');
      setNewRuleDocTypes('');
      setNewRuleInvert(false);
      setNewRuleSeverity('low');
    } catch (err: any) {
      alert(`Failed to add rule: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await deleteRiskRule(dealId, ruleId);
      setRiskRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (err: any) {
      alert(`Failed to delete rule: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteAllDocuments = async () => {
    if (!confirm('Are you absolutely sure you want to delete ALL documents? This cannot be undone.')) return;
    try {
      await deleteAllDocuments(dealId);
      setDocuments([]);
      setRiskSummary({ total_flags: 0, high: 0, medium: 0, low: 0 });
      setRiskFlags([]);
    } catch {
      setError('Failed to delete all documents.');
    }
  };

  const handleSignOut = () => {
    window.localStorage.removeItem('vdr_token');
    navigate('/login');
  };

  const handleUpdateDeal = async (e: FormEvent) => {
    e.preventDefault();
    setUpdatingDeal(true);
    try {
      const res = await updateDeal(dealId, {
        name: dealName,
        description: dealDescription || undefined,
        status: dealStatus
      });
      setDeal(res.data);
      alert('Deal updated successfully!');
    } catch (err: any) {
      let msg = err.response?.data?.detail;
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      setError(`Failed to update deal: ${msg || err.message}`);
    } finally {
      setUpdatingDeal(false);
    }
  };

  const handleDeleteDeal = async () => {
    if (!confirm('Are you sure you want to delete this deal? This action cannot be undone.')) return;
    try {
      await deleteDeal(dealId);
      navigate('/deals');
    } catch (err: any) {
      setError(`Failed to delete deal: ${err.response?.data?.detail || err.message}`);
    }
  };

  const renderRiskSummary = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Risk Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Flags</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{riskSummary?.total_flags ?? 0}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
            <p className="text-xs font-semibold uppercase text-rose-600">High Risk</p>
            <p className="mt-1 text-2xl font-bold text-rose-700">{riskSummary?.high ?? 0}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
            <p className="text-xs font-semibold uppercase text-amber-600">Medium</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{riskSummary?.medium ?? 0}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
            <p className="text-xs font-semibold uppercase text-blue-600">Low</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{riskSummary?.low ?? 0}</p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button variant="outline" className="w-full" />}>
            View Detailed Risks
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detailed Risk Flags</DialogTitle>
              <DialogDescription>A comprehensive list of all identified risks in the deal documents.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {riskFlags.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No risks found in documents.</p>
              ) : (
                riskFlags.map((flag, idx) => {
                  const doc = documents.find(d => d.id === flag.document_id);
                  const severityColors = {
                    high: 'bg-rose-100 text-rose-700 border-rose-200',
                    medium: 'bg-amber-100 text-amber-700 border-amber-200',
                    low: 'bg-blue-100 text-blue-700 border-blue-200'
                  };
                  return (
                    <div key={idx} className="border rounded-md p-4 bg-slate-50 relative flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{flag.rule_key}</h4>
                          <p className="text-sm text-slate-600 mt-1">{flag.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded uppercase whitespace-nowrap border ${severityColors[flag.severity as keyof typeof severityColors]}`}>
                          {flag.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t text-xs text-slate-500">
                        <span className="font-medium">Document:</span>
                        <button 
                          className="text-brand-600 hover:underline flex items-center gap-1"
                          onClick={() => {
                            if (doc) {
                              setViewerDoc({ id: doc.id, filename: doc.original_filename, type: doc.file_type });
                              setViewerOpen(true);
                            }
                          }}
                        >
                          {doc?.original_filename || 'Unknown'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Deal workspace</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{deal?.name ?? 'Deal details'}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/deals">
            <Button variant="outline">Back to deals</Button>
          </Link>
          <Button variant="default" onClick={handleSignOut}>Sign out</Button>
        </div>
      </header>

      {loading ? (
        <Card className="p-10 text-center text-slate-500">Loading deal workspace…</Card>
      ) : !deal ? (
        <Card className="p-10 text-center text-slate-500">Deal not found.</Card>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700 flex justify-between items-center shadow-sm">
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 text-lg leading-none">&times;</button>
            </div>
          )}
          <Tabs defaultValue="workspace" className="space-y-6">
          <TabsList className="bg-slate-100/50 p-1 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            <TabsTrigger value="workspace" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Workspace</TabsTrigger>
            <TabsTrigger value="report" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Due Diligence Report</TabsTrigger>
            {user?.role?.startsWith('seller') && (
              <TabsTrigger value="members" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Manage Members</TabsTrigger>
            )}
            <TabsTrigger value="risk_rules" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Risk Rules</TabsTrigger>
            {user?.role?.startsWith('seller') && (
              <TabsTrigger value="settings" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="workspace">
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] items-start">
              {/* Left Column */}
              <div className="flex flex-col gap-6 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>AI Search Assistant</CardTitle>
                  <CardDescription>Ask questions about documents. Evidence will be cited directly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-4">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. What are the termination rights?"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={searching}>
                      {searching ? 'Searching…' : 'Search'}
                    </Button>
                  </form>

                  {searchResult && (
                    <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Answer</p>
                      <p className="text-sm leading-relaxed text-slate-900">{searchResult.answer}</p>
                      
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Evidence Sources</p>
                        <div className="space-y-3">
                          {searchResult.sources.length ? (
                            searchResult.sources.map((source, idx) => (
                              <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-semibold text-brand-700">{source.filename}</p>
                                  {source.page_number != null && (
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Page {source.page_number}</span>
                                  )}
                                </div>
                                <div className="border-l-2 border-brand-200 pl-3 text-slate-600 italic">
                                  "{source.text}"
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No matching sources found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {user?.role?.startsWith('seller') && (
                <Card>
                    <CardHeader>
                      <CardTitle>Upload Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Document file</Label>
                            <Input type="file" accept=".pdf,.docx" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Document type</Label>
                            <Select value={documentType} onValueChange={(val) => setDocumentType(val as string)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="nda">NDA</SelectItem>
                                <SelectItem value="agreement">Agreement</SelectItem>
                                <SelectItem value="financial">Financial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed roles</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {DEFAULT_ROLES.map(role => (
                              <label key={role} className="flex items-center space-x-2 text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded cursor-pointer hover:bg-slate-100">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-300"
                                  checked={allowedRoles.includes(role)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setAllowedRoles(prev => [...prev, role]);
                                    } else {
                                      setAllowedRoles(prev => prev.filter(r => r !== role));
                                    }
                                  }}
                                />
                                <span>{role.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                          {submitting ? 'Uploading…' : 'Upload Document'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
              )}

              {/* For buyers, Risk Summary goes in the left column */}
              {!user?.role?.startsWith('seller') && renderRiskSummary()}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* For sellers, Risk Summary goes in the right column */}
              {user?.role?.startsWith('seller') && renderRiskSummary()}
              
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <CardTitle>Documents</CardTitle>
                    {user?.role?.startsWith('seller') && documents.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleDeleteAllDocuments} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 text-xs font-semibold">
                        Delete All
                      </Button>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Compare Docs</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Compare Documents</DialogTitle>
                        <DialogDescription>Select two documents to generate a comparative analysis.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Select value={doc1Id} onValueChange={(val) => setDoc1Id(val as string)}>
                            <SelectTrigger><SelectValue placeholder="Document 1" /></SelectTrigger>
                            <SelectContent>
                              {documents.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.original_filename}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Select value={doc2Id} onValueChange={(val) => setDoc2Id(val as string)}>
                            <SelectTrigger><SelectValue placeholder="Document 2" /></SelectTrigger>
                            <SelectContent>
                              {documents.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.original_filename}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCompare} disabled={comparing || !doc1Id || !doc2Id}>
                          {comparing ? 'Analyzing...' : 'Compare'}
                        </Button>
                        {compareResult && (
                          <div className="mt-4 p-4 bg-slate-50 border rounded-md text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                            {compareResult}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(groupedDocuments).map(([type, docs]) => (
                    <div key={type} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">{type}</h4>
                      {docs.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex justify-between items-center rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-sm hover:bg-slate-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setViewerDoc({ id: doc.id, filename: doc.original_filename, type: doc.file_type });
                            setViewerOpen(true);
                          }}
                        >
                          <div className="truncate pr-4 font-medium flex-1 min-w-0 text-brand-700">{doc.original_filename}</div>
                          <div className="flex items-center gap-4">
                            <div className="shrink-0 text-xs text-slate-500 uppercase">{doc.document_type}</div>
                            {user?.role?.startsWith('seller') && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDoc({ id: doc.id, filename: doc.original_filename, type: doc.document_type });
                                    setEditDocName(doc.original_filename);
                                    setEditDocType(doc.document_type || 'general');
                                  }}
                                  className="text-slate-400 hover:text-brand-600 transition-colors"
                                  title="Edit document details"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteDocument(doc.id, e)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors"
                                  title="Delete document"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No documents uploaded.</p>}
                </CardContent>
              </Card>
            </div>
            
            <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Document Details</DialogTitle>
                  <DialogDescription>Update the filename and category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateDocument} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Filename</Label>
                    <Input value={editDocName} onChange={(e) => setEditDocName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={editDocType} onValueChange={(val) => setEditDocType(val as string)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="nda">NDA</SelectItem>
                        <SelectItem value="agreement">Agreement</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={updatingDoc}>
                    {updatingDoc ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            <Card className="min-h-[500px]">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Executive Due Diligence Report</CardTitle>
                    <CardDescription>AI-generated comprehensive analysis of all deal documents.</CardDescription>
                  </div>
                  <Button onClick={handleGenerateReport} disabled={generatingReport}>
                    {generatingReport ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!report ? (
                  <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
                    Click generate to create a new report based on current documents.
                  </div>
                ) : (
                  <div className="space-y-8 max-w-4xl mx-auto">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Executive Summary</h3>
                      <div className="prose prose-sm prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
                        {report.executive_summary}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Deal Timeline</h3>
                      <div className="space-y-4">
                        {report.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-32 shrink-0 text-sm font-semibold text-brand-700 pt-1">
                              {event.date}
                            </div>
                            <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                              <p className="text-sm text-slate-900 font-medium">{event.event}</p>
                              <p className="text-xs text-slate-500 mt-1">Source: {event.document_source}</p>
                            </div>
                          </div>
                        ))}
                        {report.timeline.length === 0 && <p className="text-sm text-slate-500">No timeline events detected.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card className="min-h-[500px]">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle>Manage Members</CardTitle>
                <CardDescription>Add new buyer users to this deal to grant them access.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-slate-900">Current Members</h3>
                  <div className="space-y-3">
                    {members.map(member => (
                      <div key={member.id} className="flex justify-between items-center rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-sm">
                        <div className="truncate pr-4 flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{member.user.full_name}</p>
                          <p className="text-xs text-slate-500">{member.user.email} &middot; {member.role}</p>
                        </div>
                        {user?.role?.startsWith('seller') && (
                          <button 
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 ml-2"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {members.length === 0 && <p className="text-sm text-slate-500">No active members.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-4 text-slate-900">Add New Member</h3>
                  <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <Select value={selectedBuyerId} onValueChange={(val) => setSelectedBuyerId(val as string)}>
                      <SelectTrigger><SelectValue placeholder="Select a user to invite" /></SelectTrigger>
                      <SelectContent>
                        {buyers.map(b => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.full_name} ({b.email}) - {b.role}</SelectItem>
                        ))}
                        {buyers.length === 0 && <SelectItem value="disabled" disabled>No users found</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Role in Deal</Label>
                    <Select value={selectedBuyerRole} onValueChange={(val) => setSelectedBuyerRole(val as string)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer_lawyer">Buyer Lawyer</SelectItem>
                        <SelectItem value="buyer_finance">Buyer Finance</SelectItem>
                        <SelectItem value="buyer_executive">Buyer Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={addingMember || !selectedBuyerId}>
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </Button>
                </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk_rules">
            <Card className="min-h-[500px]">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle>Manage Custom Risk Rules</CardTitle>
                <CardDescription>Add deal-specific custom rules for the risk engine using regular expressions.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid gap-8 xl:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Existing Rules</h3>
                  <div className="space-y-4">
                    {riskRules.map(rule => (
                      <div key={rule.id} className="border rounded-md p-4 bg-slate-50 relative">
                        <button onClick={() => handleDeleteRule(rule.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                        <p className="font-semibold">{rule.rule_key}</p>
                        <p className="text-sm text-slate-600 mb-2">{rule.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-1 rounded font-medium ${rule.severity === 'high' ? 'bg-rose-100 text-rose-700' : rule.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>{rule.severity}</span>
                          <span className="px-2 py-1 rounded bg-slate-200 font-mono text-slate-700">{rule.patterns.join(', ')}</span>
                          {rule.invert && <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700">Inverted</span>}
                          {rule.document_types && <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">Docs: {rule.document_types.join(', ')}</span>}
                        </div>
                      </div>
                    ))}
                    {riskRules.length === 0 && <p className="text-slate-500 text-sm">No custom rules for this deal.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Add New Rule</h3>
                  <form onSubmit={handleAddRule} className="space-y-4 bg-white border p-4 rounded-md shadow-sm">
                    <div className="space-y-2">
                      <Label>Rule Key (Identifier)</Label>
                      <Input value={newRuleKey} onChange={e => setNewRuleKey(e.target.value)} required placeholder="e.g. non_compete" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={newRuleDesc} onChange={e => setNewRuleDesc(e.target.value)} required placeholder="Explanation of the risk" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select value={newRuleSeverity} onValueChange={(val) => setNewRuleSeverity(val as string)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Invert Match?</Label>
                        <div className="pt-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newRuleInvert} onChange={e => setNewRuleInvert(e.target.checked)} />
                            Flag if NOT found
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Patterns (Regex, comma separated)</Label>
                      <Input value={newRulePatterns} onChange={e => setNewRulePatterns(e.target.value)} required placeholder="e.g. non-compete, compete.*clause" />
                    </div>
                    <div className="space-y-2">
                      <Label>Document Types (Optional, comma separated)</Label>
                      <Input value={newRuleDocTypes} onChange={e => setNewRuleDocTypes(e.target.value)} placeholder="e.g. nda, agreement" />
                    </div>
                    <Button type="submit" disabled={addingRule} className="w-full">
                      {addingRule ? 'Adding...' : 'Add Rule'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Deal Settings</CardTitle>
                <CardDescription>Update the deal information and status.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateDeal} className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Deal Name</Label>
                    <Input 
                      value={dealName} 
                      onChange={(e) => setDealName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={dealDescription} 
                      onChange={(e) => setDealDescription(e.target.value)} 
                      placeholder="Optional" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={dealStatus} onValueChange={(val) => setDealStatus(val as string)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={updatingDeal}>
                    {updatingDeal ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
                {user?.role === 'seller_admin' && (
                  <div className="mt-12 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-rose-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Permanently delete this deal and all of its associated documents and risk flags. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteDeal}>
                      Delete Deal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>

          <DocumentViewer 
            dealId={dealId} 
            documentId={viewerDoc?.id || 0}
            filename={viewerDoc?.filename || ''}
            fileType={viewerDoc?.type || ''}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
          />
        </div>
      )}
    </main>
  );
}
