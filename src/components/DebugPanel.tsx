import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { addSampleData, checkConnection } from "@/utils/testData";
import { Database, Bug, CheckCircle, XCircle, Loader2 } from "lucide-react";

export const DebugPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown");
  const [companiesCount, setCompaniesCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await checkConnection();
      setConnectionStatus(isConnected ? "connected" : "error");
      
      if (isConnected) {
        // Get counts
        const { count: companiesCount } = await supabase
          .from("companies")
          .select("*", { count: "exact", head: true });
        
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true });
        
        setCompaniesCount(companiesCount);
        setJobsCount(jobsCount);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const addData = async () => {
    setIsLoading(true);
    try {
      await addSampleData();
      // Refresh counts
      await testConnection();
    } catch (error) {
      console.error("Failed to add data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Bug className="h-4 w-4" />
          <span>Debug Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection:</span>
            <Badge variant={connectionStatus === "connected" ? "default" : connectionStatus === "error" ? "destructive" : "secondary"}>
              {connectionStatus === "connected" && <CheckCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === "error" && <XCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === "unknown" && <Loader2 className="h-3 w-3 mr-1" />}
              {connectionStatus}
            </Badge>
          </div>
          
          {companiesCount !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Companies:</span>
              <Badge variant="outline">{companiesCount}</Badge>
            </div>
          )}
          
          {jobsCount !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Jobs:</span>
              <Badge variant="outline">{jobsCount}</Badge>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={testConnection}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={addData}
            disabled={isLoading}
            className="flex-1"
          >
            Add Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

