import type React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card"
import { CoaTable } from "./coa-table"
import { BarChartHorizontalBig, FileText, Download, ListChecks, Settings2, Building2, History } from "lucide-react"
import type {
  OutputContentType,
  ChartOfAccount,
  Contact,
  TransactionException,
  FinalReportData,
  TransactionRule,
  CompanyProfile,
  ProcessingRun,
} from "../lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface OutputPanelProps {
  content: {
    type: OutputContentType
    data: unknown
  }
}

const EmptyState = ({
  title,
  description,
  icon: Icon,
}: { title: string; description: string; icon: React.ElementType }) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-4 space-y-3">
    <Icon className="w-16 h-16 text-primary/30" strokeWidth={1.5} />
    <h4 className="font-medium text-lg">{title}</h4>
    <p className="text-sm">{description}</p>
  </div>
)

export function OutputPanel({ content }: OutputPanelProps) {
  let title = "Output"
  let view = (
    <EmptyState
      title="Output Panel"
      description="Your generated Chart of Accounts, categorized transactions, and other outputs will appear here as S(ai)m Jr processes your data."
      icon={BarChartHorizontalBig}
    />
  )

  if (content.type === "coa" && content.data) {
    title = "Chart of Accounts"
    view = <CoaTable data={content.data as ChartOfAccount[]} />
  } else if (content.type === "transactions" && content.data) {
    title = "Categorized Transactions"
    const transactions = content.data as { date: string; description: string; amount: number; category: string }[]
    view = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium truncate max-w-[150px]">{item.description}</TableCell>
                <TableCell className={item.amount < 0 ? "text-destructive" : ""}>{item.amount.toFixed(2)}</TableCell>
                <TableCell>{item.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } else if (content.type === "contacts" && content.data) {
    title = "Contacts"
    const contacts = content.data as Contact[]
    view = (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {contacts.length > 0 ? `${contacts.length} contacts in profile.` : "No contacts in profile."}
        </p>
        {contacts.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.slice(0, 5).map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {contacts.length > 5 && (
              <p className="text-xs text-muted-foreground p-2">And {contacts.length - 5} more...</p>
            )}
          </div>
        )}
      </div>
    )
  } else if (content.type === "exceptions" && content.data) {
    title = "Transaction Exceptions"
    const exceptions = content.data as TransactionException[]
    view = (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {exceptions.filter((ex) => !ex.isResolved).length > 0
            ? `${exceptions.filter((ex) => !ex.isResolved).length} unresolved exceptions.`
            : "No unresolved exceptions."}
        </p>
        {exceptions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.slice(0, 10).map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-medium truncate max-w-[100px]">{ex.description}</TableCell>
                    <TableCell className={ex.amount < 0 ? "text-destructive" : ""}>{ex.amount.toFixed(2)}</TableCell>
                    <TableCell>{ex.reason}</TableCell>
                    <TableCell>
                      <Badge variant={ex.isResolved ? "secondary" : "outline"}>
                        {ex.isResolved ? "Resolved" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {exceptions.length > 10 && (
              <p className="text-xs text-muted-foreground p-2">And {exceptions.length - 10} more...</p>
            )}
          </div>
        ) : (
          <EmptyState
            title="No Exceptions Found"
            description="S(ai)m Jr. didn't find any transactions needing special review in this run."
            icon={ListChecks}
          />
        )}
      </div>
    )
  } else if (content.type === "final_report" && content.data) {
    title = "Final Report"
    const reportData = content.data as FinalReportData
    view = (
      <div className="space-y-4 text-center">
        <FileText className="w-16 h-16 text-primary/30 mx-auto" strokeWidth={1.5} />
        <h4 className="font-semibold text-lg">Report Generated</h4>
        <p className="text-sm text-muted-foreground">
          {reportData.summary} for period {reportData.periodFrom} to {reportData.periodTo}.
        </p>
        {reportData.reportUrl ? (
          <Button asChild>
            <a href={reportData.reportUrl} download>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </a>
          </Button>
        ) : (
          <p className="text-xs text-destructive">Report download link not available.</p>
        )}
      </div>
    )
  } else if (content.type === "rules" && content.data) {
    title = "Active Transaction Rules"
    const rules = content.data as TransactionRule[]
    view = (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {rules.length > 0 ? `${rules.length} active rules.` : "No custom rules defined yet."}
        </p>
        {rules.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Target Account</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.slice(0, 10).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.applyToAccountName}</TableCell>
                    <TableCell>{rule.timesApplied}x</TableCell>
                    <TableCell>
                      <Badge variant={rule.accuracy > 0.8 ? "default" : "secondary"}>
                        {(rule.accuracy * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rules.length > 10 && <p className="text-xs text-muted-foreground p-2">And {rules.length - 10} more...</p>}
          </div>
        ) : (
          <EmptyState
            title="No Custom Rules"
            description="You can create rules when handling transaction exceptions to automate future categorizations."
            icon={Settings2}
          />
        )}
      </div>
    )
  } else if (content.type === "company_profile" && content.data) {
    title = "Company Profile"
    const profile = content.data as CompanyProfile
    view = (
      <div className="space-y-4">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-primary/30 mx-auto mb-2" strokeWidth={1.5} />
          <h4 className="font-semibold text-lg">{profile.businessName}</h4>
          <p className="text-sm text-muted-foreground">{profile.natureOfBusiness}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Industry:</strong> {profile.industry}
          </div>
          <div>
            <strong>Location:</strong> {profile.location}
          </div>
          <div>
            <strong>Framework:</strong> {profile.reportingFramework}
          </div>
          <div>
            <strong>Compliances:</strong> {profile.statutoryCompliances.join(", ")}
          </div>
          <div>
            <strong>Setup Date:</strong> {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg">{profile.chartOfAccounts.length}</div>
            <div className="text-xs text-muted-foreground">Accounts</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg">{profile.contacts.length}</div>
            <div className="text-xs text-muted-foreground">Contacts</div>
          </div>
        </div>
      </div>
    )
  } else if (content.type === "processing_history" && content.data) {
    title = "Processing History"
    const runs = content.data as ProcessingRun[]
    view = (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {runs.length > 0 ? `${runs.length} processing runs completed.` : "No processing history yet."}
        </p>
        {runs.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.slice(0, 10).map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium truncate max-w-[100px]">{run.fileName}</TableCell>
                    <TableCell className="text-xs">
                      {run.periodFrom} to {run.periodTo}
                    </TableCell>
                    <TableCell>{run.transactionCount}</TableCell>
                    <TableCell className="text-xs">{new Date(run.processedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {runs.length > 10 && <p className="text-xs text-muted-foreground p-2">And {runs.length - 10} more...</p>}
          </div>
        ) : (
          <EmptyState
            title="No Processing History"
            description="Your bank statement processing history will appear here as you use S(ai)m Jr."
            icon={History}
          />
        )}
      </div>
    )
  }

  return (
    <aside className="w-96 bg-card border-l p-6 flex-col hidden xl:flex">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {content.type === "company_profile" && <Building2 className="h-5 w-5" />}
            {content.type === "processing_history" && <History className="h-5 w-5" />}
            {content.type === "rules" && <Settings2 className="h-5 w-5" />}
            {title}
          </CardTitle>
          {content.type === "transactions" && <CardDescription>Preview of categorized transactions.</CardDescription>}
          {content.type === "exceptions" && <CardDescription>Review and resolve transaction issues.</CardDescription>}
          {content.type === "rules" && <CardDescription>Manage your custom automation rules.</CardDescription>}
          {content.type === "company_profile" && <CardDescription>Your business profile and setup.</CardDescription>}
          {content.type === "processing_history" && (
            <CardDescription>Historical bank statement processing.</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-y-auto">{view}</CardContent>
      </Card>
    </aside>
  )
}
