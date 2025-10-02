'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, CompanyProfileRequest, COAWorkflowResponse, ContactRequest } from '@/lib/api-client-production';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, Upload, User, Building, FileText, CreditCard, Target } from 'lucide-react';

interface WorkflowStage {
  id: number;
  name: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

interface CompanyProfile {
  id?: number;
  company_name: string;
  nature_of_business: string;
  industry: string;
  location: string;
  company_type: string;
  reporting_framework: string;
  statutory_compliances: string[];
  business_size: string;
  annual_turnover?: number;
  employee_count?: number;
}

const CompleteWorkflow: React.FC = () => {
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    company_name: '',
    nature_of_business: '',
    industry: '',
    location: '',
    company_type: '',
    reporting_framework: 'GAAP',
    statutory_compliances: [],
    business_size: 'Small',
  });
  const [coaWorkflow, setCoaWorkflow] = useState<COAWorkflowResponse | null>(null);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const stages: WorkflowStage[] = [
    {
      id: 1,
      name: 'Company Profile',
      icon: <Building className="w-5 h-5" />,
      completed: currentStage > 1,
      current: currentStage === 1,
    },
    {
      id: 2,
      name: 'Chart of Accounts',
      icon: <FileText className="w-5 h-5" />,
      completed: currentStage > 2,
      current: currentStage === 2,
    },
    {
      id: 3,
      name: 'Contact Management',
      icon: <User className="w-5 h-5" />,
      completed: currentStage > 3,
      current: currentStage === 3,
    },
    {
      id: 4,
      name: 'Bank Statements',
      icon: <CreditCard className="w-5 h-5" />,
      completed: currentStage > 4,
      current: currentStage === 4,
    },
    {
      id: 5,
      name: 'Transaction Mapping',
      icon: <Target className="w-5 h-5" />,
      completed: currentStage > 5,
      current: currentStage === 5,
    },
  ];

  // Stage 1: Company Profile Creation
  const handleCompanyProfileSubmit = async () => {
    setLoading(true);
    try {
      const response = await apiClient.createCompanyProfile(companyProfile as CompanyProfileRequest);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      if (response.data) {
        setCompanyProfile({ ...companyProfile, id: response.data.id });
        setCurrentStage(2);
        toast({
          title: 'Success',
          description: 'Company profile created successfully!',
        });
      }
    } catch (error) {
      console.error('Company profile creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create company profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Chart of Accounts Generation
  const handleCOAGeneration = async () => {
    if (!companyProfile.id) {
      toast({
        title: 'Error',
        description: 'Please complete company profile first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.generateCOAWorkflow(companyProfile.id);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      if (response.data) {
        setCoaWorkflow(response.data);
        setCurrentStage(3);
        toast({
          title: 'Success',
          description: 'Chart of Accounts generated successfully!',
        });
      }
    } catch (error) {
      console.error('COA generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate Chart of Accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (file: File, stage: number) => {
    if (!companyProfile.id) {
      toast({
        title: 'Error',
        description: 'Please complete company profile first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (stage === 2) {
        // COA Upload
        response = await apiClient.uploadCOA(companyProfile.id, file);
      } else {
        // For other stages, we'll use COA upload as fallback
        // TODO: Implement stage-specific file upload endpoints
        response = await apiClient.uploadCOA(companyProfile.id, file);
      }

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      setUploadedFiles(prev => [...prev, file]);
      toast({
        title: 'Success',
        description: `${file.name} uploaded successfully!`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Contact Management
  const addContact = () => {
    setContacts(prev => [...prev, {
      name: '',
      contact_type: 'customer',
      email: '',
      phone: '',
    }]);
  };

  const updateContact = (index: number, field: keyof ContactRequest, value: string) => {
    setContacts(prev => prev.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    ));
  };

  const renderStageProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">5-Stage AI Accounting Workflow</h2>
        <Progress value={(currentStage / 5) * 100} className="w-1/3" />
      </div>
      
      <div className="flex items-center space-x-4 overflow-x-auto pb-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${
              stage.completed 
                ? 'bg-green-100 border-green-500 text-green-700'
                : stage.current
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}>
              {stage.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                stage.icon
              )}
              <span className="font-medium whitespace-nowrap">{stage.name}</span>
            </div>
            
            {index < stages.length - 1 && (
              <div className={`w-8 h-1 mx-2 ${
                stage.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {renderStageProgress()}
      
      <Tabs value={currentStage.toString()} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {stages.map((stage) => (
            <TabsTrigger 
              key={stage.id} 
              value={stage.id.toString()}
              disabled={stage.id > currentStage}
              className="flex items-center space-x-2"
            >
              {stage.icon}
              <span className="hidden sm:inline">{stage.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Stage 1: Company Profile */}
        <TabsContent value="1" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-6 h-6" />
                <span>Company Profile Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={companyProfile.company_name}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select 
                    value={companyProfile.industry} 
                    onValueChange={(value) => setCompanyProfile(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select 
                    value={companyProfile.company_type} 
                    onValueChange={(value) => setCompanyProfile(prev => ({ ...prev, company_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={companyProfile.location}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State, Country"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nature_of_business">Nature of Business *</Label>
                <Textarea
                  id="nature_of_business"
                  value={companyProfile.nature_of_business}
                  onChange={(e) => setCompanyProfile(prev => ({ ...prev, nature_of_business: e.target.value }))}
                  placeholder="Describe your business activities..."
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleCompanyProfileSubmit}
                disabled={loading || !companyProfile.company_name || !companyProfile.industry}
                className="w-full"
              >
                {loading ? 'Creating Profile...' : 'Create Company Profile & Continue'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 2: Chart of Accounts */}
        <TabsContent value="2" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>AI-Driven Chart of Accounts Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription>
                  Our AI will generate a comprehensive Chart of Accounts based on your company profile through a 5-step process:
                  <br />1. Financial Statements Analysis
                  <br />2. Account Classes Definition
                  <br />3. Classifications Creation
                  <br />4. Subclassifications Setup
                  <br />5. Individual Accounts Generation
                </AlertDescription>
              </Alert>

              {!coaWorkflow ? (
                <div className="space-y-4">
                  <Button 
                    onClick={handleCOAGeneration}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Generating Chart of Accounts...' : 'Generate AI-Powered Chart of Accounts'}
                  </Button>
                  
                  <div className="text-center text-gray-500">
                    OR
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Existing Chart of Accounts</p>
                    <p className="text-gray-500 mb-4">Upload a CSV file with your existing chart of accounts</p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 2);
                      }}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Chart of Accounts generated successfully! {coaWorkflow.metadata.total_accounts} accounts created.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Workflow Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Statements:</strong> {Object.keys(coaWorkflow.workflow_steps.statements).length}</p>
                          <p><strong>Classes:</strong> {Object.keys(coaWorkflow.workflow_steps.classes).length}</p>
                          <p><strong>Classifications:</strong> {Object.keys(coaWorkflow.workflow_steps.classifications).length}</p>
                          <p><strong>Total Accounts:</strong> {coaWorkflow.metadata.total_accounts}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Generation Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Method:</strong> {coaWorkflow.metadata.generation_method}</p>
                          <p><strong>AI Model:</strong> {coaWorkflow.metadata.ai_model || 'OpenAI GPT-4'}</p>
                          <p><strong>Generated:</strong> {new Date(coaWorkflow.metadata.generated_at).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button 
                    onClick={() => setCurrentStage(3)}
                    className="w-full"
                  >
                    Continue to Contact Management
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 3: Contact Management */}
        <TabsContent value="3" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-6 h-6" />
                <span>Contact Management Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Add your customers, vendors, and other business contacts</p>
                <Button onClick={addContact} variant="outline">
                  Add Contact
                </Button>
              </div>
              
              {contacts.length === 0 ? (
                <Alert>
                  <User className="w-4 h-4" />
                  <AlertDescription>
                    No contacts added yet. Add contacts to enable automatic transaction categorization.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            placeholder="Contact Name"
                            value={contact.name}
                            onChange={(e) => updateContact(index, 'name', e.target.value)}
                          />
                          <Select 
                            value={contact.contact_type} 
                            onValueChange={(value) => updateContact(index, 'contact_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Email"
                            type="email"
                            value={contact.email || ''}
                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={() => setCurrentStage(4)}
                className="w-full"
                disabled={contacts.length === 0}
              >
                Continue to Bank Statement Upload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 4: Bank Statements */}
        <TabsContent value="4" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span>Bank Statement Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CreditCard className="w-4 h-4" />
                <AlertDescription>
                  Upload your bank statements for automatic transaction extraction and processing.
                  Supported formats: PDF, CSV, QIF, OFX
                </AlertDescription>
              </Alert>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Bank Statements</h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop your bank statement files here, or click to browse
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.csv,.qif,.ofx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleFileUpload(file, 4));
                  }}
                  className="max-w-sm mx-auto"
                />
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline">{file.name}</Badge>
                      <span className="text-sm text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={() => setCurrentStage(5)}
                className="w-full"
                disabled={uploadedFiles.length === 0}
              >
                Continue to Transaction Mapping
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 5: Transaction Mapping */}
        <TabsContent value="5" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6" />
                <span>AI Transaction Mapping & Categorization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Target className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  AI will now process your transactions using:
                  <br />• Entity extraction from transaction descriptions
                  <br />• Contact matching with your contact database
                  <br />• Account categorization based on Chart of Accounts
                  <br />• Historical pattern recognition for improved accuracy
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Transactions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">0</div>
                      <p className="text-sm text-gray-500">Processing...</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Categorized</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">0</div>
                      <p className="text-sm text-gray-500">Auto-categorized</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Circle className="w-5 h-5" />
                      <span>Review Needed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">0</div>
                      <p className="text-sm text-gray-500">Manual review</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 Congratulations! Your 5-stage AI accounting workflow setup is complete!
                  <br />Your system is now ready for automated transaction processing.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => {
                  toast({
                    title: 'Workflow Complete!',
                    description: 'Your AI accounting system is now fully configured.',
                  });
                }}
                className="w-full"
                size="lg"
              >
                Complete Setup & Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompleteWorkflow;