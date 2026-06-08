import { useState } from "react";
import { usePredict, useGetSamples, useGetModelStatus, getGetSamplesQueryKey, getGetModelStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LightCurveChart } from "@/components/LightCurveChart";
import { FunFacts } from "@/components/FunFacts";
import { Uploader } from "@/components/Uploader";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { toast } = useToast();
  const [selectedFlux, setSelectedFlux] = useState<number[] | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const { data: modelStatus } = useGetModelStatus({ 
    query: { 
      queryKey: getGetModelStatusQueryKey(),
      refetchInterval: (query) => {
        return query.state.data?.ready ? false : 3000;
      }
    } 
  });

  const { data: samples, isLoading: samplesLoading } = useGetSamples({ 
    query: { queryKey: getGetSamplesQueryKey() } 
  });

  const predict = usePredict();

  const handlePredict = (flux: number[], label?: string | null) => {
    setSelectedFlux(flux);
    setSelectedLabel(label || null);
    predict.mutate(
      { data: { flux } },
      {
        onError: () => {
          toast({
            title: "Error",
            description: "Prediction failed. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const isModelReady = modelStatus?.ready;

  return (
    <div className="min-h-screen flex flex-col items-center">
      {!isModelReady && modelStatus && (
        <div className="w-full bg-accent text-accent-foreground p-4 text-center z-50 animate-in slide-in-from-top-full duration-500">
          <p className="mb-2 font-mono text-sm tracking-tight">{modelStatus.message}</p>
          <Progress value={undefined} className="h-1 w-64 mx-auto" />
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl px-4 py-12 flex flex-col gap-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-mono">EXOPLANET HUNTER</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze Kepler stellar light curves using a convolutional neural network to detect exoplanet transits.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-xl tracking-tight">ANALYZER</CardTitle>
                <CardDescription>Select a sample or upload a light curve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Samples</h3>
                  {samplesLoading ? (
                    <div className="flex gap-2 animate-pulse">
                      <div className="h-10 w-24 bg-muted rounded-md" />
                      <div className="h-10 w-24 bg-muted rounded-md" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {samples?.map((sample) => (
                        <Button
                          key={sample.id}
                          variant="outline"
                          size="sm"
                          disabled={!isModelReady || predict.isPending}
                          onClick={() => handlePredict(sample.flux, sample.label)}
                          data-testid={`btn-sample-${sample.id}`}
                          className="font-mono"
                        >
                          {sample.id}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upload</h3>
                  <Uploader onUpload={(flux) => handlePredict(flux)} disabled={!isModelReady || predict.isPending} />
                </div>
              </CardContent>
            </Card>

            {selectedFlux && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-border/50 bg-black/20 flex flex-col items-center justify-center min-h-[160px]">
                    {predict.isPending ? (
                      <div className="space-y-4 w-full max-w-sm text-center">
                        <p className="font-mono text-primary animate-pulse tracking-widest text-sm">ANALYZING FLUX DATA...</p>
                        <Progress value={undefined} className="h-1" />
                      </div>
                    ) : predict.data ? (
                      <div className="text-center w-full space-y-4">
                          <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${predict.data.is_exoplanet ? 'text-primary' : 'text-muted-foreground'}`}>
                            {predict.data.is_exoplanet ? 'EXOPLANET DETECTED' : 'NO EXOPLANET'}
                          </h2>
                          {selectedLabel && (
                            <Badge variant="outline" className="font-mono rounded-none px-3 text-muted-foreground">
                              TRUE LABEL: {selectedLabel}
                            </Badge>
                          )}
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 font-mono tracking-widest">LIGHT CURVE FLUX</h3>
                    <LightCurveChart flux={selectedFlux} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <FunFacts />
          </div>
        </section>
      </main>
    </div>
  );
}