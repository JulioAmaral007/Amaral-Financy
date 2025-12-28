"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Wallet, 
  Receipt, 
  PieChart,
  AlertCircle,
  CheckCircle2,
  Users,
  DollarSign,
  ArrowDown
} from "lucide-react";
import { 
  calculateSalaryPayment, 
  calculateContributionPercentages,
  type SalaryPaymentResult 
} from "@/lib/salary-calculator";

export default function BillSplit() {
  const [salary1, setSalary1] = useState<string>("");
  const [salary2, setSalary2] = useState<string>("");
  const [salary3, setSalary3] = useState<string>("");
  const [billAmount, setBillAmount] = useState<string>("");
  const [result, setResult] = useState<SalaryPaymentResult | null>(null);
  const [percentages, setPercentages] = useState<{
    salary1Percentage: number;
    salary2Percentage: number;
    salary3Percentage: number;
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  const handleCalculate = () => {
    const input = {
      salary1: parseNumber(salary1),
      salary2: parseNumber(salary2),
      salary3: parseNumber(salary3),
      billAmount: parseNumber(billAmount),
    };

    const paymentResult = calculateSalaryPayment(input);
    setResult(paymentResult);

    if (paymentResult.success) {
      const percResult = calculateContributionPercentages(input);
      setPercentages(percResult);
    } else {
      setPercentages(null);
    }
  };

  const handleClear = () => {
    setSalary1("");
    setSalary2("");
    setSalary3("");
    setBillAmount("");
    setResult(null);
    setPercentages(null);
  };

  const totalSalaries = parseNumber(salary1) + parseNumber(salary2) + parseNumber(salary3);
  const sal1Value = parseNumber(salary1);
  const billValue = parseNumber(billAmount);
  const excedesSalary1 = billValue > sal1Value && sal1Value > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Divisão de Contas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Divida suas contas usando o salário 1 como prioritário
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="border border-border shadow-sm transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Dados para Cálculo</h2>
                <p className="text-sm text-muted-foreground">Informe os valores abaixo</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Salário 1 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Salário 1 (Prioritário)
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Usado inteiro primeiro
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={salary1}
                    onChange={(e) => setSalary1(e.target.value)}
                    className="pl-10 h-12 bg-muted border-border"
                  />
                </div>
              </div>

              {/* Salário 2 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-base" />
                  Salário 2
                  <span className="text-xs text-muted-foreground">
                    (Proporcional do excedente)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={salary2}
                    onChange={(e) => setSalary2(e.target.value)}
                    className="pl-10 h-12 bg-muted border-border"
                  />
                </div>
              </div>

              {/* Salário 3 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-base" />
                  Salário 3
                  <span className="text-xs text-muted-foreground">
                    (Proporcional do excedente)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={salary3}
                    onChange={(e) => setSalary3(e.target.value)}
                    className="pl-10 h-12 bg-muted border-border"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border my-4" />

              {/* Valor da Conta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-orange-base" />
                  Valor da Conta
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="pl-10 h-12 bg-muted border-border"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Soma dos Salários:</span>
                  <span className="font-medium text-foreground">{formatCurrency(totalSalaries)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor da Conta:</span>
                  <span className="font-medium text-foreground">{formatCurrency(billValue)}</span>
                </div>
                {excedesSalary1 && (
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Excedente (Sal.2 + Sal.3):</span>
                    <span className="font-medium text-orange-base">{formatCurrency(billValue - sal1Value)}</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={handleClear}
                >
                  Limpar
                </Button>
                <Button 
                  className="flex-1 h-12 bg-primary hover:bg-brand-dark"
                  onClick={handleCalculate}
                  disabled={!salary1 && !salary2}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Error State */}
          {result && !result.success && (
            <Card className="border border-destructive/50 bg-destructive/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-destructive mb-1">Erro no Cálculo</h3>
                    <p className="text-sm text-destructive/80">{result.errorMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {result && result.success && (
            <>
              {/* Distribution Cards */}
              <div className="space-y-4">
                {/* Salário 1 - Prioritário */}
                {sal1Value > 0 && (
                  <Card className="border-2 border-primary/50 shadow-sm transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">Salário 1</p>
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                Prioritário
                              </span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(result.salary1Payment)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold text-primary">
                              {percentages?.salary1Percentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">do salário</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentages?.salary1Percentage || 0, 100)}%` }}
                        />
                      </div>
                      {result.salary1Payment === sal1Value && billValue > sal1Value && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <ArrowDown className="h-3 w-3" />
                          Usado integralmente. Excedente dividido abaixo.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Salário 2 */}
                {parseNumber(salary2) > 0 && (
                  <Card className="border border-border shadow-sm transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-light flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-blue-base" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Salário 2</p>
                            <p className="text-lg font-bold text-foreground">
                              {formatCurrency(result.salary2Payment)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold text-blue-base">
                              {percentages?.salary2Percentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">do salário</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-base rounded-full transition-all duration-500"
                          style={{ width: `${percentages?.salary2Percentage || 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Salário 3 */}
                {parseNumber(salary3) > 0 && (
                  <Card className="border border-border shadow-sm transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-purple-base" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Salário 3</p>
                            <p className="text-lg font-bold text-foreground">
                              {formatCurrency(result.salary3Payment)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold text-purple-base">
                              {percentages?.salary3Percentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">do salário</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-base rounded-full transition-all duration-500"
                          style={{ width: `${percentages?.salary3Percentage || 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary Card */}
              <Card className="border border-border shadow-sm transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Resumo da Divisão</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Conta Total</span>
                      <span className="font-semibold text-foreground">{formatCurrency(billValue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Pago pelo Salário 1</span>
                      <span className="font-semibold text-primary">{formatCurrency(result.salary1Payment)}</span>
                    </div>
                    {(result.salary2Payment > 0 || result.salary3Payment > 0) && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Excedente dividido</span>
                        <span className="font-semibold text-orange-base">
                          {formatCurrency(result.salary2Payment + result.salary3Payment)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">% Total Comprometido</span>
                      <span className="font-semibold text-success">
                        {((billValue / totalSalaries) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!result && (
            <Card className="border border-border shadow-sm transition-colors">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Como Funciona</h3>
                <div className="text-sm text-muted-foreground max-w-sm mx-auto space-y-2">
                  <p><strong>1.</strong> O Salário 1 paga a conta inteira até seu limite</p>
                  <p><strong>2.</strong> Se a conta exceder, o restante é dividido proporcionalmente entre Salário 2 e 3</p>
                  <p className="pt-2 text-primary">
                    Preencha os valores e clique em "Calcular"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
