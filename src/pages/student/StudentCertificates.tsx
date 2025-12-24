import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Download, ExternalLink, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentCertificates() {
  const { user } = useUserRole();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["student-certificates-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const copyVerificationId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Verification ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and download your earned certificates
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : certificates?.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Certificates Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Complete courses to earn certificates that validate your cybersecurity skills.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates?.map((cert) => (
              <Card key={cert.id} className="bg-card border-border overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-primary via-cyan to-accent" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Award className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Certificate of Completion
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.course_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student Name</p>
                      <p className="font-medium text-foreground">{cert.student_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issue Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                    <span className="text-xs text-muted-foreground">Verification ID:</span>
                    <code className="text-xs font-mono text-foreground flex-1">
                      {cert.verification_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyVerificationId(cert.verification_id)}
                    >
                      {copiedId === cert.verification_id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
