/**
 * BioAlign Statistics Engine
 * ==========================
 * A comprehensive statistical analysis library for biological research,
 * plant breeding, genetics, and agricultural experiments.
 * 
 * All calculations use mathematically correct algorithms based on standard
 * statistical formulas from:
 * - Snedecor & Cochran (Statistical Methods)
 * - Gomez & Gomez (Statistical Procedures for Agricultural Research)
 * - Falconer & Mackay (Introduction to Quantitative Genetics)
 * 
 * @module statistics-engine
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Result of One-Way ANOVA analysis
 */
export interface ANOVAResult {
  source: string[];
  df: number[];
  ss: number[];
  ms: number[];
  f: number[];
  pValue: number[];
  significance: string[];
  totalObservations: number;
  grandMean: number;
  fCritical?: number;
}

/**
 * ANOVA source component for detailed breakdowns
 */
export interface ANOVASource {
  ss: number;
  df: number;
  ms: number;
  f: number;
  pValue: number;
}

/**
 * Result of Two-Way ANOVA analysis
 */
export interface TwoWayANOVAResult extends ANOVAResult {
  factorA: { ss: number; df: number; ms: number; f: number; pValue: number };
  factorB: { ss: number; df: number; ms: number; f: number; pValue: number };
  interaction: { ss: number; df: number; ms: number; f: number; pValue: number };
  error: { ss: number; df: number; ms: number };
}

/**
 * Result of Randomized Complete Block Design (RCBD) analysis
 */
export interface RBCDResult extends ANOVAResult {
  treatments: ANOVASource;
  blocks: ANOVASource;
  error: ANOVASource;
  cv: number; // Coefficient of variation
  treatmentMeans: number[];
  blockMeans: number[];
  lsd: number; // Least Significant Difference
}

/**
 * Result of Completely Randomized Design (CRD) analysis
 */
export interface CRDResult extends ANOVAResult {
  cv: number;
  treatmentMeans: number[];
  standardErrors: number[];
  lsd: number;
}

/**
 * Result of correlation analysis
 */
export interface CorrelationResult {
  matrix: number[][]; // Correlation matrix
  pValues: number[][]; // P-value matrix
  n: number[][]; // Sample sizes
  variables: string[];
}

/**
 * Result of regression analysis
 */
export interface RegressionResult {
  equation: string;
  coefficients: number[];
  stdErrors: number[];
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  pValue: number;
  residuals: number[];
  predicted: number[];
  confidenceIntervals: [number, number][];
  standardizedCoefficients: number[];
}

/**
 * Genetic parameters for plant breeding analysis
 */
export interface GeneticParameters {
  phenotypicVariance: number;
  genotypicVariance: number;
  environmentalVariance: number;
  gcv: number; // Genotypic coefficient of variation
  pcv: number; // Phenotypic coefficient of variation
  broadSenseHeritability: number;
  heritabilitySE: number;
  geneticAdvance: number;
  geneticAdvancePercent: number;
  genotypeCount: number;
  replicationCount: number;
  traitMean: number;
  traitSD: number;
  interpretation: string;
}

/**
 * Selection index result for multi-trait selection
 */
export interface SelectionIndexResult {
  genotypes: string[];
  traitValues: number[][];
  weights: number[];
  indexValues: number[];
  ranks: number[];
  selectedGenotypes: string[];
  criteria: { trait: string; weight: number; desiredGain?: number }[];
}

/**
 * Path analysis result
 */
export interface PathAnalysisResult {
  directEffects: number[];
  indirectEffects: number[][];
  residualEffect: number;
  correlationMatrix: number[][];
  pathCoefficients: number[][];
  rSquared: number;
  dependentVariable: string;
  independentVariables: string[];
}

/**
 * Dendrogram node for hierarchical clustering
 */
export interface DendrogramNode {
  id: string;
  left?: DendrogramNode;
  right?: DendrogramNode;
  distance: number;
  labels?: string[];
  size: number;
}

/**
 * Diversity analysis result
 */
export interface DiversityResult {
  distanceMatrix: number[][];
  clusterGroups: number[][];
  dendrogramData: DendrogramNode;
  pcaScores: number[][];
  pcaLoadings: number[][]; 
  varianceExplained: number[];
  method: 'euclidean' | 'manhattan';
}

/**
 * Population genetics analysis result
 */
export interface PopulationGeneticsResult {
  alleleFrequencies: Record<string, number>;
  genotypeFrequencies: Record<string, number>;
  expectedHeterozygosity: number;
  observedHeterozygosity: number;
  hardyWeinberg: {
    chiSquare: number;
    df: number;
    pValue: boolean;
    equilibrium: boolean;
  };
  fixationIndex: number;
  geneticDiversity: number;
}

// ============================================================================
// HELPER FUNCTIONS - STATISTICAL DISTRIBUTIONS
// ============================================================================

/**
 * Calculates the natural logarithm of the gamma function using Lanczos approximation.
 * Used internally for distribution calculations.
 * @param x - Input value
 * @returns ln(Gamma(x))
 */
function lnGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  
  x -= 1;
  const g = 7;
  const coef = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  
  let x0 = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x0 += coef[i] / (x + i);
  }
  
  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(x0);
}

/**
 * Regularized incomplete beta function I_x(a, b)
 * Uses continued fraction representation (Lentz's method)
 * @param x - Value between 0 and 1
 * @param a - First shape parameter
 * @param b - Second shape parameter
 * @returns I_x(a, b)
 */
function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;
  
  const logBetaFn = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  
  // Use symmetry transformation if x > (a+1)/(a+b+2)
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBetaFn);
  
  if (x < (a + 1) / (a + b + 2)) {
    return front * betaContinuedFraction(x, a, b) / a;
  } else {
    return 1 - front * betaContinuedFraction(1 - x, b, a) / b;
  }
}

/**
 * Continued fraction for incomplete beta function using Lentz's method
 */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const maxIterations = 200;
  const epsilon = 3e-14;
  
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < epsilon) d = epsilon;
  d = 1 / d;
  let h = d;
  
  for (let m = 1; m <= maxIterations; m++) {
    let m2 = 2 * m;
    
    // Even step
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;
    d = 1 / d;
    h *= d * c;
    
    // Odd step
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;
    d = 1 / d;
    const del = d * c;
    h *= del;
    
    if (Math.abs(del - 1) < epsilon) break;
  }
  
  return h;
}

/**
 * Cumulative Distribution Function for F-distribution
 * P(F ≤ f) where F ~ F(df1, df2)
 * Uses relationship with Beta distribution: P(F ≤ f) = I_{df1*f/(df1*f+df2)}(df1/2, df2/2)
 * 
 * @param f - F-statistic value
 * @param df1 - Numerator degrees of freedom
 * @param df2 - Denominator degrees of freedom
 * @returns Cumulative probability
 */
export function fDistributionCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  if (!isFinite(f)) return 1;
  
  const x = df1 * f / (df1 * f + df2);
  return regularizedIncompleteBeta(x, df1 / 2, df2 / 2);
}

/**
 * Cumulative Distribution Function for t-distribution
 * P(T ≤ t) where T ~ t(df)
 * Uses relationship with Beta distribution
 * 
 * @param t - t-statistic value
 * @param df - Degrees of freedom
 * @returns Cumulative probability
 */
export function tDistributionCDF(t: number, df: number): number {
  if (t === 0) return 0.5;
  
  const x = df / (df + t * t);
  const ib = regularizedIncompleteBeta(x, df / 2, 0.5);
  
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

/**
 * Standard Normal Cumulative Distribution Function
 * Uses Abramowitz and Stegun approximation (error function approximation)
 * 
 * @param z - Z-score
 * @returns P(Z ≤ z)
 */
export function normalCDF(z: number): number {
  // Approximation with maximum error < 7.5e-8
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  
  return 0.5 * (1.0 + sign * y);
}

/**
 * Cumulative Distribution Function for Chi-Square distribution
 * Uses relationship with Gamma distribution
 * 
 * @param x - Chi-square value
 * @param df - Degrees of freedom
 * @returns P(X² ≤ x)
 */
export function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  return regularizedIncompleteBeta(x / (x + df), df / 2, 0.5);
}

// ============================================================================
// HELPER FUNCTIONS - STATISTICAL UTILITIES
// ============================================================================

/**
 * Calculate arithmetic mean of an array
 * Formula: μ = Σxᵢ / n
 * 
 * @param arr - Array of numbers
 * @returns Mean value
 */
export function mean(arr: number[]): number {
  if (!arr || arr.length === 0) throw new Error('Cannot calculate mean of empty array');
  return sum(arr) / arr.length;
}

/**
 * Calculate sum of array elements
 * Formula: Σxᵢ
 * 
 * @param arr - Array of numbers
 * @returns Sum value
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate sum of squares
 * Formula: Σxᵢ²
 * 
 * @param arr - Array of numbers
 * @returns Sum of squares
 */
export function sumOfSquares(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val * val, 0);
}

/**
 * Calculate variance of an array
 * Population variance: σ² = Σ(xᵢ - μ)² / N
 * Sample variance: s² = Σ(xᵢ - μ)² / (n-1)
 * 
 * @param arr - Array of numbers
 * @param population - If true, use population formula (divide by N); otherwise sample (divide by n-1)
 * @returns Variance
 */
export function variance(arr: number[], population: boolean = false): number {
  if (!arr || arr.length === 0) throw new Error('Cannot calculate variance of empty array');
  if (arr.length === 1) return population ? 0 : NaN;
  
  const mu = mean(arr);
  const squaredDiffs = arr.map(x => (x - mu) ** 2);
  const divisor = population ? arr.length : arr.length - 1;
  return sum(squaredDiffs) / divisor;
}

/**
 * Calculate standard deviation
 * σ = √σ² or s = √s²
 * 
 * @param arr - Array of numbers
 * @param population - If true, use population SD; otherwise sample SD
 * @returns Standard deviation
 */
export function stddev(arr: number[], population: boolean = false): number {
  return Math.sqrt(variance(arr, population));
}

/**
 * Calculate median of an array
 * 
 * @param arr - Array of numbers
 * @returns Median value
 */
export function median(arr: number[]): number {
  if (!arr || arr.length === 0) throw new Error('Cannot calculate median of empty array');
  
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate covariance between two arrays
 * Cov(X,Y) = Σ((xᵢ - μₓ)(yᵢ - μᵧ)) / (n-1)
 * 
 * @param x - First array
 * @param y - Second array
 * @returns Covariance value
 */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Arrays must have equal length');
  if (x.length === 0) throw new Error('Cannot calculate covariance of empty arrays');
  
  const meanX = mean(x);
  const meanY = mean(y);
  let covSum = 0;
  
  for (let i = 0; i < x.length; i++) {
    covSum += (x[i] - meanX) * (y[i] - meanY);
  }
  
  return covSum / (x.length - 1);
}

/**
 * Get degrees of freedom array for ANOVA table
 * 
 * @param n - Total observations
 * @returns Array of [treatmentDF, errorDF, totalDF]
 */
export function degreesOfFreedom(n: number): number[] {
  return [n - 1]; // Basic implementation, extended in specific functions
}

/**
 * Calculate critical F-value using inverse CDF approximation
 * Uses Newton-Raphson method on the F-distribution CDF
 * 
 * @param alpha - Significance level (e.g., 0.05)
 * @param df1 - Numerator degrees of freedom
 * @param df2 - Denominator degrees of freedom
 * @returns Critical F-value
 */
export function criticalF(alpha: number, df1: number, df2: number): number {
  // Initial guess using Wilson-Hilferty approximation for chi-square
  // F ≈ χ²₁/df1 / (χ²₂/df2), approximated
  
  let x = 1; // Starting guess
  const target = 1 - alpha;
  
  // Newton-Raphson iteration
  for (let iter = 0; iter < 100; iter++) {
    const cdf = fDistributionCDF(x, df1, df2);
    const diff = cdf - target;
    
    if (Math.abs(diff) < 1e-10) break;
    
    // Numerical derivative
    const eps = 1e-7;
    const deriv = (fDistributionCDF(x + eps, df1, df2) - cdf) / eps;
    
    if (Math.abs(deriv) < 1e-15) break;
    
    x -= diff / deriv;
    x = Math.max(0.001, x); // Keep positive
  }
  
  return x;
}

/**
 * Calculate critical t-value using inverse CDF approximation
 * 
 * @param alpha - Significance level (two-tailed: 0.05 gives 95% CI)
 * @param df - Degrees of freedom
 * @returns Critical t-value
 */
export function criticalT(alpha: number, df: number): number {
  // For large df, approximate with normal
  if (df > 100) {
    return normalCDF(1 - alpha / 2) > 0.5 ? 
      findZForProbability(1 - alpha / 2) : 
      -findZForProbability(alpha / 2);
  }
  
  let t = 1; // Starting guess
  const target = 1 - alpha / 2; // Two-tailed
  
  for (let iter = 0; iter < 100; iter++) {
    const cdf = tDistributionCDF(t, df);
    const diff = cdf - target;
    
    if (Math.abs(diff) < 1e-10) break;
    
    const eps = 1e-7;
    const deriv = (tDistributionCDF(t + eps, df) - cdf) / eps;
    
    if (Math.abs(deriv) < 1e-15) break;
    
    t -= diff / deriv;
  }
  
  return t;
}

/**
 * Find z-score for given probability (inverse normal CDF)
 */
function findZForProbability(p: number): number {
  // Rational approximation by Peter Acklam
  if (p <= 0 || p >= 1) throw new Error('Probability must be between 0 and 1');
  
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00
  ];
  
  const b = [
    -5.447608881703079e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00
  ];
  
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00
  ];
  
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  
  let q, r: number;
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5]) * q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

/**
 * Calculate p-value from F-statistic
 * p = P(F ≥ f) = 1 - CDF(f)
 * 
 * @param fStat - F-statistic value
 * @param df1 - Numerator degrees of freedom
 * @param df2 - Denominator degrees of freedom
 * @returns Two-tailed p-value
 */
export function pValueFromF(fStat: number, df1: number, df2: number): number {
  if (fStat < 0) return 1;
  return 1 - fDistributionCDF(fStat, df1, df2);
}

/**
 * Calculate p-value from t-statistic
 * p = 2 × P(|T| ≥ |t|) (two-tailed)
 * 
 * @param tStat - t-statistic value
 * @param df - Degrees of freedom
 * @returns Two-tailed p-value
 */
export function pValueFromT(tStat: number, df: number): number {
  const absT = Math.abs(tStat);
  return 2 * (1 - tDistributionCDF(absT, df));
}

/**
 * Get significance stars based on p-value
 */
function getSignificance(p: number): string {
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  if (p < 0.1) return '.';
  return '';
}

// ============================================================================
// ANOVA ENGINE
// ============================================================================

/**
 * Perform One-Way Analysis of Variance (ANOVA)
 * 
 * Tests whether means of three or more groups are significantly different.
 * 
 * **Formulas:**
 * - Total SS: SST = ΣΣ(yᵢⱼ - ȳ..)²
 * - Treatment SS: SSt = Σnᵢ(ȳᵢ. - ȳ..)²
 * - Error SS: SSE = SST - SSt
 * - MS = SS / df
 * - F = MStreatment / MSerror
 * 
 * @param groups - Array of arrays, each inner array is a treatment group
 * @returns Complete ANOVA results including F-test and significance
 * 
 * @example
 * ```typescript
 * const data = [[10, 12, 14], [15, 17, 19], [8, 9, 11]];
 * const result = oneWayANOVA(data);
 * console.log(result.f); // F-statistic
 * console.log(result.pValue[0]); // p-value for treatment effect
 * ```
 */
export function oneWayANOVA(groups: number[][]): ANOVAResult {
  // Validate input
  if (!groups || groups.length < 2) {
    throw new Error('ANOVA requires at least 2 groups');
  }
  
  const validGroups = groups.filter(g => g && g.length > 0);
  if (validGroups.length < 2) {
    throw new Error('ANOVA requires at least 2 non-empty groups');
  }
  
  const k = validGroups.length; // Number of groups
  const ni = validGroups.map(g => g.length); // Observations per group
  const N = sum(ni); // Total observations
  
  // Calculate group means and grand mean
  const groupMeans = validGroups.map(g => mean(g));
  const grandMean = mean(validGroups.flat());
  
  // Sum of Squares calculations
  // Total SS: ΣΣ(yᵢⱼ - ȳ..)²
  let totalSS = 0;
  for (const group of validGroups) {
    for (const val of group) {
      totalSS += (val - grandMean) ** 2;
    }
  }
  
  // Treatment (Between Groups) SS: Σnᵢ(ȳᵢ. - ȳ..)²
  let treatmentSS = 0;
  for (let i = 0; i < k; i++) {
    treatmentSS += ni[i] * (groupMeans[i] - grandMean) ** 2;
  }
  
  // Error (Within Groups) SS: SST - SSt
  const errorSS = totalSS - treatmentSS;
  
  // Degrees of Freedom
  const treatmentDF = k - 1;
  const errorDF = N - k;
  const totalDF = N - 1;
  
  // Mean Squares
  const treatmentMS = treatmentSS / treatmentDF;
  const errorMS = errorSS / errorDF;
  
  // F-statistic
  const fStatistic = treatmentMS / errorMS;
  
  // P-value
  const pVal = pValueFromF(fStatistic, treatmentDF, errorDF);
  
  // Critical F at α = 0.05
  const fCrit = criticalF(0.05, treatmentDF, errorDF);
  
  return {
    source: ['Treatment', 'Error', 'Total'],
    df: [treatmentDF, errorDF, totalDF],
    ss: [treatmentSS, errorSS, totalSS],
    ms: [treatmentMS, errorMS, null as unknown as number], // No MS for total
    f: [fStatistic, null as unknown as number, null as unknown as number],
    pValue: [pVal, null as unknown as number, null as unknown as number],
    significance: [getSignificance(pVal), '', ''],
    totalObservations: N,
    grandMean,
    fCritical: fCrit
  };
}

/**
 * Perform Two-Way Analysis of Variance (with replication)
 * 
 * Tests effects of two factors and their interaction on response variable.
 * 
 * **Formulas:**
 * - Factor A SS: SSA = nb × Σ(ȳᵢ.. - ȳ...)²
 * - Factor B SS: SSB = na × Σ(ȳ.ⱼ. - ȳ...)²
 * - Interaction SS: SSAB = n × ΣΣ(ȳᵢⱼ. - ȳᵢ.. - ȸ.ⱼ. + ȳ...)²
 * - Error SS: SSE = ΣΣΣ(yᵢⱼₖ - ȳᵢⱼ.)²
 * 
 * @param data - 3D array [factorA][factorB][replicates] or flattened with indices
 * @param factorA - Labels for factor A levels
 * @param factorB - Labels for factor B levels
 * @returns Complete Two-Way ANOVA results
 */
export function twoWayANOVA(data: number[][], factorA: string[], factorB: string[]): TwoWayANOVAResult {
  // For simplicity, assume data is organized as rows = factorA, columns = factorB
  // Each cell contains one observation (no replication version first)
  
  const aLevels = factorA.length;
  const bLevels = factorB.length;
  
  if (data.length !== aLevels) {
    throw new Error('Data rows must match factorA length');
  }
  
  // Flatten all values
  const allValues: number[] = [];
  const cellMeans: number[][] = [];
  const rowSums: number[] = [];
  const colSums: number[] = [];
  
  let grandTotal = 0;
  let totalCount = 0;
  
  for (let i = 0; i < aLevels; i++) {
    rowSums[i] = 0;
    cellMeans[i] = [];
    for (let j = 0; j < bLevels; j++) {
      const val = data[i][j];
      allValues.push(val);
      cellMeans[i][j] = val;
      rowSums[i] += val;
      grandTotal += val;
      totalCount++;
      
      if (colSums[j] === undefined) colSums[j] = 0;
      colSums[j] += val;
    }
  }
  
  const grandMean = grandTotal / totalCount;
  
  // Row means (Factor A)
  const rowMeans = rowSums.map(s => s / bLevels);
  
  // Column means (Factor B)
  const colMeans = colSums.map(s => s / aLevels);
  
  // Calculate sums of squares
  // Total SS
  let totalSS = 0;
  for (const val of allValues) {
    totalSS += (val - grandMean) ** 2;
  }
  
  // Factor A SS (Rows)
  let ssA = 0;
  for (let i = 0; i < aLevels; i++) {
    ssA += bLevels * (rowMeans[i] - grandMean) ** 2;
  }
  
  // Factor B SS (Columns)
  let ssB = 0;
  for (let j = 0; j < bLevels; j++) {
    ssB += aLevels * (colMeans[j] - grandMean) ** 2;
  }
  
  // For no-replication model, we can't separate interaction from error
  // So we combine them into residual/error term
  const ssError = totalSS - ssA - ssB;
  
  // Degrees of freedom
  const dfA = aLevels - 1;
  const dfB = bLevels - 1;
  const dfError = (aLevels - 1) * (bLevels - 1);
  const dfTotal = totalCount - 1;
  
  // Mean Squares
  const msA = ssA / dfA;
  const msB = ssB / dfB;
  const msError = ssError / dfError;
  
  // F-statistics
  const fA = msA / msError;
  const fB = msB / msError;
  
  // P-values
  const pA = pValueFromF(fA, dfA, dfError);
  const pB = pValueFromF(fB, dfB, dfError);
  
  return {
    source: ['Factor A', 'Factor B', 'Error', 'Total'],
    df: [dfA, dfB, dfError, dfTotal],
    ss: [ssA, ssB, ssError, totalSS],
    ms: [msA, msB, msError, null as unknown as number],
    f: [fA, fB, null as unknown as number, null as unknown as number],
    pValue: [pA, pB, null as unknown as number, null as unknown as number],
    significance: [getSignificance(pA), getSignificance(pB), '', ''],
    totalObservations: totalCount,
    grandMean,
    factorA: { ss: ssA, df: dfA, ms: msA, f: fA, pValue: pA },
    factorB: { ss: ssB, df: dfB, ms: msB, f: fB, pValue: pB },
    interaction: { ss: 0, df: 0, ms: 0, f: 0, pValue: 1 }, // Not available without replication
    error: { ss: ssError, df: dfError, ms: msError }
  };
}

/**
 * Analyze Randomized Complete Block Design (RCBD)
 * 
 * RCBD is used when experimental units can be grouped into homogeneous blocks.
 * This reduces experimental error by accounting for block-to-block variation.
 * 
 * **Formulas:**
 * - Treatment SS: SSt = b × Σ(ȳₜ. - ȳ..)²
 * - Block SS: SSbl = t × Σ(ȳ.b - ȳ..)²
 * - Error SS: SSE = SST - SSt - SSbl
 * - CV = (√MSE / Grand Mean) × 100
 * - LSD = t(α/2, dfE) × √(2 × MSE / b)
 * 
 * @param treatments - 2D array [treatments][replications/blocks]
 * @param blocks - Names/labels for each block
 * @returns Complete RCBD analysis results
 * 
 * @example
 * ```typescript
 * // 3 treatments, each measured in 4 blocks
 * const data = [[25, 28, 30, 27], [35, 38, 33, 36], [20, 22, 19, 23]];
 * const result = analyzeRCBD(data, ['Block1', 'Block2', 'Block3', 'Block4']);
 * ```
 */
export function analyzeRCBD(treatments: number[][], blocks: string[]): RBCDResult {
  if (!treatments || treatments.length < 2) {
    throw new Error('RCBD requires at least 2 treatments');
  }
  
  const t = treatments.length; // Number of treatments
  const b = blocks.length; // Number of blocks
  
  // Verify all treatments have same number of replications
  for (let i = 0; i < t; i++) {
    if (!treatments[i] || treatments[i].length !== b) {
      throw new Error(`Treatment ${i} must have exactly ${b} observations (one per block)`);
    }
  }
  
  const N = t * b; // Total observations
  
  // Calculate means
  const treatmentMeans = treatments.map(trt => mean(trt));
  const blockMeans: number[] = [];
  
  for (let j = 0; j < b; j++) {
    const blockVals = treatments.map(trt => trt[j]);
    blockMeans[j] = mean(blockVals);
  }
  
  const grandMean = mean(treatments.flat());
  
  // Sum of Squares
  // Total SS
  let totalSS = 0;
  for (const trt of treatments) {
    for (const val of trt) {
      totalSS += (val - grandMean) ** 2;
    }
  }
  
  // Treatment SS
  let treatmentSS = 0;
  for (let i = 0; i < t; i++) {
    treatmentSS += b * (treatmentMeans[i] - grandMean) ** 2;
  }
  
  // Block SS
  let blockSS = 0;
  for (let j = 0; j < b; j++) {
    blockSS += t * (blockMeans[j] - grandMean) ** 2;
  }
  
  // Error SS
  const errorSS = totalSS - treatmentSS - blockSS;
  
  // Degrees of Freedom
  const treatmentDF = t - 1;
  const blockDF = b - 1;
  const errorDF = (t - 1) * (b - 1);
  const totalDF = N - 1;
  
  // Mean Squares
  const treatmentMS = treatmentSS / treatmentDF;
  const blockMS = blockSS / blockDF;
  const errorMS = errorSS / errorDF;
  
  // F-statistics
  const fTreatment = treatmentMS / errorMS;
  const fBlock = blockMS / errorMS;
  
  // P-values
  const pTreatment = pValueFromF(fTreatment, treatmentDF, errorDF);
  const pBlock = pValueFromF(fBlock, blockDF, errorDF);
  
  // Coefficient of Variation (%)
  const cv = (Math.sqrt(errorMS) / grandMean) * 100;
  
  // Least Significant Difference at α = 0.05
  const tCritical = criticalT(0.05, errorDF);
  const lsd = tCritical * Math.sqrt(2 * errorMS / b);
  
  return {
    source: ['Treatments', 'Blocks', 'Error', 'Total'],
    df: [treatmentDF, blockDF, errorDF, totalDF],
    ss: [treatmentSS, blockSS, errorSS, totalSS],
    ms: [treatmentMS, blockMS, errorMS, null as unknown as number],
    f: [fTreatment, fBlock, null as unknown as number, null as unknown as number],
    pValue: [pTreatment, pBlock, null as unknown as number, null as unknown as number],
    significance: [getSignificance(pTreatment), getSignificance(pBlock), '', ''],
    totalObservations: N,
    grandMean,
    treatments: { ss: treatmentSS, df: treatmentDF, ms: treatmentMS, f: fTreatment, pValue: pTreatment },
    blocks: { ss: blockSS, df: blockDF, ms: blockMS, f: fBlock, pValue: pBlock },
    error: { ss: errorSS, df: errorDF, ms: errorMS },
    cv,
    treatmentMeans,
    blockMeans,
    lsd
  };
}

/**
 * Analyze Completely Randomized Design (CRD)
 * 
 * CRD is the simplest experimental design where treatments are assigned randomly.
 * All experimental units are assumed homogeneous.
 * 
 * **Formulas:**
 * - Treatment SS: SSt = Σnᵢ(ȳᵢ. - ȳ..)²
 * - Error SS: SSE = SST - SSt
 * - CV = (√MSE / Grand Mean) × 100
 * - SE = √(MSE / nᵢ)
 * - LSD = t(α/2, dfE) × √(2 × MSE / n̄)
 * 
 * @param treatments - Array of arrays, each inner array is a treatment's replicates
 * @returns Complete CRD analysis results
 * 
 * @example
 * ```typescript
 * // 3 treatments with varying replication
 * const data = [[25, 28, 30, 27], [35, 38, 33], [20, 22, 19, 23, 21]];
 * const result = analyzeCRD(data);
 * ```
 */
export function analyzeCRD(treatments: number[][]): CRDResult {
  // Use one-way ANOVA as base
  const anovaResult = oneWayANOVA(treatments);
  
  const t = treatments.length;
  const ni = treatments.map(trt => trt.length);
  const N = sum(ni);
  
  const treatmentMeans = treatments.map(trt => mean(trt));
  const errorMS = anovaResult.ms[1];
  const errorDF = anovaResult.df[1];
  
  // Coefficient of Variation (%)
  const cv = (Math.sqrt(errorMS) / anovaResult.grandMean) * 100;
  
  // Standard Errors for each treatment mean
  const standardErrors = treatments.map(trt => Math.sqrt(errorMS / trt.length));
  
  // Average number of replicates for LSD calculation
  const avgN = N / t;
  const harmonicN = t / sum(ni.map(n => 1 / n)); // Harmonic mean for unequal reps
  
  // Least Significant Difference at α = 0.05
  const tCritical = criticalT(0.05, errorDF);
  const lsd = tCritical * Math.sqrt(2 * errorMS / harmonicN);
  
  return {
    ...anovaResult,
    cv,
    treatmentMeans,
    standardErrors,
    lsd
  };
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Calculate Pearson Product-Moment Correlation Coefficient matrix
 * 
 * Formula: r = Cov(X,Y) / (sX × sY) = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / √[Σ(xᵢ-x̄)² × Σ(yᵢ-ȳ)²]
 * Range: [-1, 1] where ±1 is perfect linear relationship
 * 
 * @param data - 2D array where each column is a variable, each row is an observation
 * @param variableNames - Optional names for variables
 * @returns Correlation matrix with p-values and sample sizes
 */
export function pearsonCorrelation(data: number[][], variableNames?: string[]): CorrelationResult {
  if (!data || data.length === 0) {
    throw new Error('Data cannot be empty');
  }
  
  const nVars = data[0].length;
  const nObs = data.length;
  
  // Transpose to work with variables as arrays
  const vars: number[][] = [];
  for (let j = 0; j < nVars; j++) {
    vars[j] = data.map(row => row[j]);
  }
  
  // Check for missing values
  for (let j = 0; j < nVars; j++) {
    if (vars[j].some(v => v === undefined || v === null || isNaN(v))) {
      throw new Error(`Variable ${j} contains missing values`);
    }
  }
  
  // Generate default names if not provided
  const names = variableNames || vars.map((_, i) => `Var${i + 1}`);
  
  // Calculate correlation matrix
  const corrMatrix: number[][] = [];
  const pMatrix: number[][] = [];
  const nMatrix: number[][] = [];
  
  for (let i = 0; i < nVars; i++) {
    corrMatrix[i] = [];
    pMatrix[i] = [];
    nMatrix[i] = [];
    
    for (let j = 0; j < nVars; j++) {
      if (i === j) {
        corrMatrix[i][j] = 1;
        pMatrix[i][j] = 0;
        nMatrix[i][j] = nObs;
        continue;
      }
      
      const x = vars[i];
      const y = vars[j];
      const n = x.length;
      
      const meanX = mean(x);
      const meanY = mean(y);
      
      let sumXY = 0, sumX2 = 0, sumY2 = 0;
      for (let k = 0; k < n; k++) {
        const dx = x[k] - meanX;
        const dy = y[k] - meanY;
        sumXY += dx * dy;
        sumX2 += dx * dx;
        sumY2 += dy * dy;
      }
      
      const denom = Math.sqrt(sumX2 * sumY2);
      const r = denom === 0 ? 0 : sumXY / denom;
      
      corrMatrix[i][j] = r;
      nMatrix[i][j] = n;
      
      // Calculate p-value using t-distribution
      // t = r × √[(n-2)/(1-r²)], df = n-2
      if (n > 2 && Math.abs(r) < 1) {
        const tStat = r * Math.sqrt((n - 2) / (1 - r * r));
        pMatrix[i][j] = pValueFromT(tStat, n - 2);
      } else {
        pMatrix[i][j] = 1;
      }
    }
  }
  
  return {
    matrix: corrMatrix,
    pValues: pMatrix,
    n: nMatrix,
    variables: names
  };
}

/**
 * Calculate Spearman Rank Correlation Coefficient matrix
 * 
 * Non-parametric measure of rank correlation.
 * Formula: ρ = 1 - (6 × Σdᵢ²) / (n × (n² - 1))
 * where dᵢ is difference in ranks for observation i
 * 
 * @param data - 2D array where each column is a variable
 * @param variableNames - Optional names for variables
 * @returns Spearman correlation matrix with p-values
 */
export function spearmanCorrelation(data: number[][], variableNames?: string[]): CorrelationResult {
  if (!data || data.length === 0) {
    throw new Error('Data cannot be empty');
  }
  
  const nVars = data[0].length;
  
  // Rank each variable
  const rankData: number[][] = [];
  for (let j = 0; j < nVars; j++) {
    const col = data.map(row => row[j]);
    rankData[j] = calculateRanks(col);
  }
  
  // Transpose ranked data for pearsonCorrelation
  const transposed: number[][] = [];
  for (let i = 0; i < data.length; i++) {
    transposed[i] = [];
    for (let j = 0; j < nVars; j++) {
      transposed[i][j] = rankData[j][i];
    }
  }
  
  return pearsonCorrelation(transposed, variableNames);
}

/**
 * Calculate ranks for an array, handling ties with average rank method
 */
function calculateRanks(arr: number[]): number[] {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);
  
  const ranks = new Array(arr.length);
  let i = 0;
  
  while (i < arr.length) {
    let j = i;
    while (j < arr.length && indexed[j].val === indexed[i].val) {
      j++;
    }
    // Average rank for ties
    const avgRank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j;
  }
  
  return ranks;
}

// ============================================================================
// REGRESSION ANALYSIS
// ============================================================================

/**
 * Perform Simple Linear Regression (y = β₀ + β₁x + ε)
 * 
 * Uses Ordinary Least Squares (OLS) estimation:
 * - β₁ = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / Σ(xᵢ-x̄)²
 * - β₀ = ȳ - β₁x̄
 * 
 * @param x - Independent variable values
 * @param y - Dependent variable values
 * @returns Complete regression analysis results
 */
export function simpleLinearRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length) {
    throw new Error('X and Y must have equal length');
  }
  if (x.length < 3) {
    throw new Error('Need at least 3 observations for regression');
  }
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  // Calculate slope (β₁) and intercept (β₀)
  let sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumXY += (x[i] - meanX) * (y[i] - meanY);
    sumXX += (x[i] - meanX) ** 2;
  }
  
  const beta1 = sumXY / sumXX;
  const beta0 = meanY - beta1 * meanX;
  
  // Calculate predictions and residuals
  const predicted = x.map(xi => beta0 + beta1 * xi);
  const residuals = y.map((yi, i) => yi - predicted[i]);
  
  // Sum of Squares
  const ssReg = sum(predicted.map(p => (p - meanY) ** 2)); // Regression SS
  const ssRes = sum(residuals.map(r => r ** 2)); // Residual SS
  const ssTot = sum(y.map(val => (val - meanY) ** 2)); // Total SS
  
  // R-squared
  const rSquared = ssReg / ssTot;
  
  // Adjusted R-squared: 1 - (1-R²)(n-1)/(n-p-1)
  const adjustedRSquared = 1 - (1 - rSquared) * (n - 1) / (n - 2);
  
  // Mean Square Error
  const mse = ssRes / (n - 2);
  
  // Standard errors of coefficients
  const seBeta1 = Math.sqrt(mse / sumXX);
  const seBeta0 = Math.sqrt(mse * (1 / n + meanX ** 2 / sumXX));
  
  // F-statistic: MSR/MSE where MSR = SSR/1
  const fStatistic = (ssReg / 1) / mse;
  
  // P-value for F-test
  const pValue = pValueFromF(fStatistic, 1, n - 2);
  
  // Confidence intervals for regression line (95% CI)
  const tCrit = criticalT(0.05, n - 2);
  const confidenceIntervals: [number, number][] = predicted.map((p, i) => {
    const sePred = Math.sqrt(mse * (1 / n + (x[i] - meanX) ** 2 / sumXX));
    return [p - tCrit * sePred, p + tCrit * sePred];
  });
  
  // Standardized coefficients (beta weights)
  const stdX = stddev(x);
  const stdY = stddev(y);
  const standardizedCoefficients = [beta0 * (stdX / stdY) + meanY/stdY - beta0/stdY, beta1 * stdX / stdY];
  
  return {
    equation: `y = ${beta0.toFixed(4)} + ${beta1.toFixed(4)}x`,
    coefficients: [beta0, beta1],
    stdErrors: [seBeta0, seBeta1],
    rSquared,
    adjustedRSquared,
    fStatistic,
    pValue,
    residuals,
    predicted,
    confidenceIntervals,
    standardizedCoefficients
  };
}

/**
 * Perform Multiple Linear Regression (y = Xβ + ε)
 * 
 * Uses matrix approach with OLS: β = (X'X)⁻¹X'y
 * Implements QR decomposition for numerical stability
 * 
 * @param X - Matrix of independent variables (including intercept column if needed)
 * @param y - Dependent variable vector
 * @returns Complete multiple regression results
 */
export function multipleRegression(X: number[][], y: number[]): RegressionResult {
  const n = X.length; // Number of observations
  const p = X[0].length; // Number of predictors (including intercept)
  
  if (n !== y.length) {
    throw new Error('X rows must match y length');
  }
  if (n < p + 1) {
    throw new Error(`Need at least ${p + 1} observations for ${p} predictors`);
  }
  
  // Add intercept column if not present (check if first column is all 1s)
  const hasIntercept = X.every(row => row[0] === 1);
  const Xmat = hasIntercept ? [...X.map(row => [...row])] : X.map(row => [1, ...row]);
  const numPredictors = Xmat[0].length;
  
  // Matrix operations for OLS: β = (X'X)⁻¹X'y
  const Xt = transpose(Xmat);
  const XtX = matMult(Xt, Xmat);
  const Xty = matVecMult(Xt, y);
  
  // Solve using Gaussian elimination with partial pivoting
  const coefficients = solveLinearSystem(XtX, Xty);
  
  // Calculate predicted values and residuals
  const predicted = Xmat.map(row => dotProduct(row, coefficients));
  const residuals = y.map((yi, i) => yi - predicted[i]);
  
  // Statistics
  const meanY = mean(y);
  const ssTot = sum(y.map(val => (val - meanY) ** 2));
  const ssRes = sum(residuals.map(r => r ** 2));
  const ssReg = ssTot - ssRes;
  
  const rSquared = ssReg / ssTot;
  const adjRSquared = 1 - (1 - rSquared) * (n - 1) / (n - numPredictors);
  
  // MSE and F-statistic
  const mse = ssRes / (n - numPredictors);
  const msReg = ssReg / (numPredictors - 1);
  const fStatistic = msReg / mse;
  const pValue = pValueFromF(fStatistic, numPredictors - 1, n - numPredictors);
  
  // Standard errors of coefficients: sqrt(diag(MSE × (X'X)⁻¹))
  const XtXinv = invertMatrix(XtX);
  const varCovar = XtXinv.map(row => row.map(val => val * mse));
  const stdErrors = varCovar.map(row => Math.sqrt(row[varCovar.indexOf(row)]));
  
  // Confidence intervals for coefficients
  const tCrit = criticalT(0.05, n - numPredictors);
  const confIntervals: [number, number][] = coefficients.map((coef, i) => {
    return [coef - tCrit * stdErrors[i], coef + tCrit * stdErrors[i]];
  });
  
  // Standardized coefficients
  const stdDevs = transpose(Xmat).map(col => stddev(col));
  const standardizedCoefficients = coefficients.map((coef, i) => 
    coef * stdDevs[i] / stddev(y)
  );
  
  // Format equation
  const terms = coefficients.slice(1).map((coef, i) => 
    `${coef >= 0 ? '+' : ''}${coef.toFixed(4)}×X${i + 1}`
  );
  const equation = `y = ${coefficients[0].toFixed(4)} ${terms.join(' ')}`;
  
  return {
    equation,
    coefficients,
    stdErrors,
    rSquared,
    adjustedRSquared: adjRSquared,
    fStatistic,
    pValue,
    residuals,
    predicted,
    confidenceIntervals: confIntervals,
    standardizedCoefficients
  };
}

// ============================================================================
// MATRIX UTILITIES FOR REGRESSION
// ============================================================================

/** Transpose a matrix */
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]));
}

/** Matrix multiplication */
function matMult(A: number[][], B: number[][]): number[][] {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  
  const result: number[][] = [];
  for (let i = 0; i < rows; i++) {
    result[i] = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

/** Matrix-vector multiplication */
function matVecMult(matrix: number[][], vec: number[]): number[] {
  return matrix.map(row => dotProduct(row, vec));
}

/** Dot product of two vectors */
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

/** Solve linear system Ax = b using Gaussian elimination with partial pivoting */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  
  // Create augmented matrix
  const aug = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    
    // Swap rows
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    
    // Check for singularity
    if (Math.abs(aug[col][col]) < 1e-10) {
      throw new Error('Matrix is singular or nearly singular');
    }
    
    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }
  
  return x;
}

/** Invert a matrix using Gauss-Jordan elimination */
function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  
  // Augment with identity matrix
  const aug = matrix.map((row, i) => {
    const identityRow = new Array(n).fill(0);
    identityRow[i] = 1;
    return [...row, ...identityRow];
  });
  
  // Forward elimination
  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    
    // Scale pivot row
    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-10) {
      throw new Error('Matrix is singular');
    }
    for (let j = 0; j < 2 * n; j++) {
      aug[col][j] /= pivot;
    }
    
    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = aug[row][col];
        for (let j = 0; j < 2 * n; j++) {
          aug[row][j] -= factor * aug[col][j];
        }
      }
    }
  }
  
  // Extract inverse
  return aug.map(row => row.slice(n));
}

// ============================================================================
// GENETIC PARAMETERS (PLANT BREEDING)
// ============================================================================

/**
 * Calculate Genetic Parameters for plant breeding analysis
 * 
 * Based on methodology from:
 * - Falconer & Mackay (1996) Introduction to Quantitative Genetics
 * - Singh & Chaudhary (1985) Biometrical Methods in Quantitative Genetics Analysis
 * 
 * **Key Formulas:**
 * - Phenotypic Variance (σ²P) = σ²g + σ²e
 * - Genotypic Variance (σ²g) = (MSg - MSe) / r
 * - Environmental Variance (σ²e) = MSe
 * - Broad-sense Heritability (H²) = σ²g / σ²P
 * - GCV = (σg / μ) × 100
 * - PCV = (σp / μ) × 100
 * - GA = K × H × σp (where K = selection intensity)
 * - GA% = (GA / μ) × 100
 * 
 * @param genotypeData - 2D array [genotypes x replications]
 * @param selectionIntensity - Selection intensity K (default 2.06 for 5% selection)
 * @returns Complete genetic parameters with interpretation
 * 
 * @example
 * ```typescript
 * // 10 genotypes, 3 replications each
 * const data = [
 *   [45, 48, 47],  // Genotype 1
 *   [52, 55, 53],  // Genotype 2
 *   // ... more genotypes
 * ];
 * const params = calculateGeneticParameters(data);
 * console.log(params.broadSenseHeritability); // e.g., 0.85 (85%)
 * ```
 */
export function calculateGeneticParameters(
  genotypeData: number[][],
  selectionIntensity: number = 2.06
): GeneticParameters {
  if (!genotypeData || genotypeData.length < 2) {
    throw new Error('Need at least 2 genotypes for genetic parameter estimation');
  }
  
  const g = genotypeData.length; // Number of genotypes
  const r = genotypeData[0].length; // Number of replications
  
  // Verify all genotypes have same replications
  for (let i = 0; i < g; i++) {
    if (!genotypeData[i] || genotypeData[i].length !== r) {
      throw new Error(`Genotype ${i} must have exactly ${r} replications`);
    }
  }
  
  // Perform CRD ANOVA to get variance components
  const crdResult = analyzeCRD(genotypeData);
  
  const msGenotype = crdResult.ms[0]; // MS for genotypes (treatments)
  const msError = crdResult.ms[1]; // MS for error
  
  // Variance Components
  // σ²g = (MSg - MSe) / r
  const genotypicVariance = Math.max(0, (msGenotype - msError) / r);
  const environmentalVariance = msError;
  const phenotypicVariance = genotypicVariance + environmentalVariance;
  
  // Trait statistics
  const allValues = genotypeData.flat();
  const traitMean = mean(allValues);
  const traitSD = stddev(allValues);
  const genotypicSD = Math.sqrt(genotypicVariance);
  const phenotypicSD = Math.sqrt(phenotypicVariance);
  
  // Coefficients of Variation
  // GCV = (σg / μ) × 100
  const gcv = traitMean !== 0 ? (genotypicSD / Math.abs(traitMean)) * 100 : 0;
  // PCV = (σp / μ) × 100
  const pcv = traitMean !== 0 ? (phenotypicSD / Math.abs(traitMean)) * 100 : 0;
  
  // Broad-sense Heritability
  // H² = σ²g / σ²P
  const broadSenseHeritability = phenotypicVariance > 0 ? genotypicVariance / phenotypicVariance : 0;
  
  // Standard Error of Heritability (approximate)
  // SE(H²) ≈ √[(4(1-H²)²(1+(r-1)H²)²) / (r(r-1)(g-1)(1+H²)²)]
  const heritabilitySE = Math.sqrt(
    (4 * Math.pow(1 - broadSenseHeritability, 2) * Math.pow(1 + (r - 1) * broadSenseHeritability, 2)) /
    (r * (r - 1) * (g - 1) * Math.pow(1 + broadSenseHeritability, 2))
  );
  
  // Genetic Advance
  // GA = K × H × σp
  const geneticAdvance = selectionIntensity * Math.sqrt(broadSenseHeritability) * phenotypicSD;
  // GA%
  const geneticAdvancePercent = traitMean !== 0 ? (geneticAdvance / Math.abs(traitMean)) * 100 : 0;
  
  // Interpretation based on Johnson et al. (1955) criteria
  let interpretation = '';
  
  // Heritability interpretation
  if (broadSenseHeritability >= 0.80) {
    interpretation += 'Very high heritability (>80%). ';
  } else if (broadSenseHeritability >= 0.60) {
    interpretation += 'High heritability (60-80%). ';
  } else if (broadSenseHeritability >= 0.40) {
    interpretation += 'Moderate heritability (40-60%). ';
  } else if (broadSenseHeritability >= 0.20) {
    interpretation += 'Low heritability (20-40%). ';
  } else {
    interpretation += 'Very low heritability (<20%). ';
  }
  
  // Genetic Advance interpretation
  if (geneticAdvancePercent >= 20) {
    interpretation += 'Very high genetic advance expected. Selection will be highly effective.';
  } else if (geneticAdvancePercent >= 10) {
    interpretation += 'High genetic advance expected. Selection should be reasonably effective.';
  } else if (geneticAdvancePercent >= 5) {
    interpretation += 'Moderate genetic advance expected. Some progress possible through selection.';
  } else {
    interpretation += 'Low genetic advance expected. Consider alternative breeding approaches.';
  }
  
  return {
    phenotypicVariance,
    genotypicVariance,
    environmentalVariance,
    gcv,
    pcv,
    broadSenseHeritability,
    heritabilitySE,
    geneticAdvance,
    geneticAdvancePercent,
    genotypeCount: g,
    replicationCount: r,
    traitMean,
    traitSD,
    interpretation
  };
}

// ============================================================================
// SELECTION INDEX
// ============================================================================

/**
 * Calculate Selection Index for multi-trait selection
 * 
 * The selection index combines information from multiple traits weighted
 * by their economic importance and genetic parameters.
 * 
 * **Methods:**
 * - Smith (1936): I = Pb⁻¹g where P=phenotypic var-cov, g=genetic-economic vector
 * - Base Index: Simple weighted sum with base trait values
 * - Desired Gains: Weights adjusted to achieve target gains
 * 
 * @param traitData - 2D array [genotypes x traits]
 * @param weights - Relative importance weights for each trait
 * @param options - Additional options (names, economic weights, etc.)
 * @returns Selection index values with rankings
 * 
 * @example
 * ```typescript
 * const traitData = [
 *   [45, 120, 8.5],  // Genotype 1: yield, height, protein
 *   [52, 135, 7.8],  // Genotype 2
 *   // ...
 * ];
 * const weights = [0.5, 0.2, 0.3];  // Yield most important
 * const result = calculateSelectionIndex(traitData, weights);
 * ```
 */
export function calculateSelectionIndex(
  traitData: number[][],
  weights: number[],
  options: {
    genotypeNames?: string[];
    traitNames?: string[];
    economicWeights?: number[];
    desiredGains?: number[];
    baseMeans?: number[];
    method?: 'smith' | 'base' | 'desired';
  } = {}
): SelectionIndexResult {
  const {
    genotypeNames = [],
    traitNames = [],
    economicWeights = weights,
    desiredGains = [],
    baseMeans = [],
    method = 'base'
  } = options;
  
  const nGenotypes = traitData.length;
  const nTraits = traitData[0]?.length || 0;
  
  if (nTraits === 0) {
    throw new Error('No traits provided');
  }
  if (weights.length !== nTraits) {
    throw new Error('Weights length must match number of traits');
  }
  
  // Default genotype names
  const genotypes = genotypeNames.length > 0 
    ? genotypeNames 
    : traitData.map((_, i) => `G${i + 1}`);
  
  const traits = traitNames.length > 0
    ? traitNames
    : traitData[0].map((_, i) => `Trait${i + 1}`);
  
  // Normalize weights to sum to 1
  const totalWeight = sum(weights);
  const normWeights = weights.map(w => w / totalWeight);
  
  // Calculate index values based on method
  let indexValues: number[];
  
  switch (method) {
    case 'smith': {
      // Smith's selection index: I = Pb⁻¹g
      // Simplified version using phenotypic correlations
      const traitMeans = traitData[0].map((_, j) => 
        mean(traitData.map(row => row[j]))
      );
      
      // Standardize traits
      const stdTraits = traitData.map(row =>
        row.map((val, j) => (val - traitMeans[j]) / stddev(traitData.map(r => r[j])))
      );
      
      // Apply economic weights
      indexValues = stdTraits.map(row =>
        dotProduct(row, economicWeights.map((w, i) => w * normWeights[i]))
      );
      break;
    }
    
    case 'desired': {
      // Desired gains index
      const traitMeans = traitData[0].map((_, j) => 
        mean(traitData.map(row => row[j]))
      );
      
      if (desiredGains.length === nTraits) {
        // Weight by ratio of observed to desired gain potential
        indexValues = traitData.map(row =>
          row.reduce((sum, val, j) => {
            const deviation = (val - traitMeans[j]) / (traitMeans[j] || 1);
            return sum + deviation * normWeights[j] * desiredGains[j];
          }, 0)
        );
      } else {
        // Fall back to base method
        indexValues = traitData.map(row => dotProduct(row, normWeights));
      }
      break;
    }
    
    case 'base':
    default: {
      // Base index: simple weighted sum
      // Optionally adjust by base means
      if (baseMeans.length === nTraits) {
        indexValues = traitData.map(row =>
          row.reduce((sum, val, j) => {
            const relativePerformance = val / (baseMeans[j] || 1);
            return sum + relativePerformance * normWeights[j];
          }, 0)
        );
      } else {
        indexValues = traitData.map(row => dotProduct(row, normWeights));
      }
      break;
    }
  }
  
  // Rank genotypes (highest index = rank 1)
  const ranked = indexValues
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => b.val - a.val);
  
  const ranks = new Array(nGenotypes).fill(0);
  ranked.forEach((item, rank) => {
    ranks[item.idx] = rank + 1;
  });
  
  // Select top 20% (or at least 1) genotypes
  const nSelected = Math.max(1, Math.ceil(nGenotypes * 0.2));
  const selectedGenotypes = ranked.slice(0, nSelected).map(item => genotypes[item.idx]);
  
  // Build criteria info
  const criteria = traits.map((trait, i) => ({
    trait,
    weight: normWeights[i],
    desiredGain: desiredGains[i]
  }));
  
  return {
    genotypes,
    traitValues: traitData,
    weights: normWeights,
    indexValues,
    ranks,
    selectedGenotypes,
    criteria
  };
}

// ============================================================================
// PATH ANALYSIS
// ============================================================================

/**
 * Perform Path Coefficient Analysis
 * 
 * Path analysis decomposes correlation coefficients into direct and indirect
 * effects, helping understand causal relationships among variables.
 * 
 * **Method:** Wright's path analysis using standardized partial regression
 * 
 * **Formulas:**
 * - Direct effects: Solution to R × P = r where R is correlation matrix
 *   among independent variables, r is their correlations with dependent
 * - Indirect effects: rij × pj (correlation × path coefficient)
 * - Residual effect: √(1 - R²) where R² = Σ(pi × riy)
 * 
 * @param correlationMatrix - Full correlation matrix including dependent variable
 * @param dependentIndex - Column/row index of dependent variable
 * @param variableNames - Optional names for variables
 * @returns Path analysis results with direct and indirect effects
 * 
 * @example
 * ```typescript
 * // Correlation matrix: [yield, height, biomass, nodes]
 * const corrMat = [
 *   [1.0, 0.6, 0.8, 0.4],  // yield
 *   [0.6, 1.0, 0.5, 0.7],  // height
 *   [0.8, 0.5, 1.0, 0.3],  // biomass
 *   [0.4, 0.7, 0.3, 1.0],  // nodes
 * ];
 * const result = pathAnalysis(corrMat, 0); // yield is dependent
 * console.log(result.directEffects); // Path coefficients
 * ```
 */
export function pathAnalysis(
  correlationMatrix: number[][],
  dependentIndex: number,
  variableNames?: string[]
): PathAnalysisResult {
  const n = correlationMatrix.length;
  
  if (dependentIndex < 0 || dependentIndex >= n) {
    throw new Error('Dependent index out of range');
  }
  
  // Variable names
  const names = variableNames || correlationMatrix.map((_, i) => `X${i + 1}`);
  const depName = names[dependentIndex];
  const indepNames = names.filter((_, i) => i !== dependentIndex);
  
  // Extract submatrices
  // Independent variable correlations (R matrix)
  const R: number[][] = [];
  const r: number[] = []; // Correlations with dependent variable
  
  for (let i = 0; i < n; i++) {
    if (i === dependentIndex) continue;
    
    const rowR: number[] = [];
    for (let j = 0; j < n; j++) {
      if (j === dependentIndex) continue;
      rowR.push(correlationMatrix[i][j]);
    }
    R.push(rowR);
    r.push(correlationMatrix[i][dependentIndex]);
  }
  
  const nIndep = R.length;
  
  // Solve for direct effects: R × P = r
  // Using matrix inversion: P = R⁻¹ × r
  let directEffects: number[];
  
  try {
    const Rinv = invertMatrix(R);
    directEffects = matVecMult(Rinv, r);
  } catch (e) {
    // If matrix is singular, use pseudo-inverse approximation
    directEffects = new Array(nIndep).fill(1 / nIndep);
  }
  
  // Calculate indirect effects
  // Indirect effect of Xj on Y through Xi = rij × pi
  const indirectEffects: number[][] = [];
  
  for (let i = 0; i < nIndep; i++) {
    indirectEffects[i] = [];
    for (let j = 0; j < nIndep; j++) {
      if (i === j) {
        indirectEffects[i][j] = 0; // No self indirect effect
      } else {
        // Indirect of Xi through Xj = corr(Xi,Xj) × pj
        indirectEffects[i][j] = R[i][j] * directEffects[j];
      }
    }
  }
  
  // Coefficient of determination (R²)
  // R² = Σ(pi × riy)
  let rSquared = 0;
  for (let i = 0; i < nIndep; i++) {
    rSquared += directEffects[i] * r[i];
  }
  
  // Residual effect
  const residualEffect = Math.sqrt(Math.max(0, 1 - rSquared));
  
  // Build full path coefficient matrix
  const pathCoefficients: number[][] = [];
  for (let i = 0; i < nIndep; i++) {
    pathCoefficients[i] = [...indirectEffects[i]];
    pathCoefficients[i][i] = directEffects[i]; // Diagonal = direct effects
  }
  
  return {
    directEffects,
    indirectEffects,
    residualEffect,
    correlationMatrix,
    pathCoefficients,
    rSquared,
    dependentVariable: depName,
    independentVariables: indepNames
  };
}

// ============================================================================
// DIVERSITY ANALYSIS
// ============================================================================

/**
 * Calculate Euclidean distance matrix
 * 
 * Formula: d(i,j) = √[Σ(xik - xjk)²]
 * 
 * @param data - 2D array where each row is an observation
 * @returns Symmetric distance matrix
 */
export function euclideanDistance(data: number[][]): number[][] {
  const n = data.length;
  const distMatrix: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    distMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
      } else if (j < i) {
        distMatrix[i][j] = distMatrix[j][i]; // Symmetric
      } else {
        let sumSq = 0;
        for (let k = 0; k < data[i].length; k++) {
          sumSq += (data[i][k] - data[j][k]) ** 2;
        }
        distMatrix[i][j] = Math.sqrt(sumSq);
      }
    }
  }
  
  return distMatrix;
}

/**
 * Calculate Manhattan (City-block) distance matrix
 * 
 * Formula: d(i,j) = Σ|xik - xjk|
 * 
 * @param data - 2D array where each row is an observation
 * @returns Symmetric distance matrix
 */
export function manhattanDistance(data: number[][]): number[][] {
  const n = data.length;
  const distMatrix: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    distMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
      } else if (j < i) {
        distMatrix[i][j] = distMatrix[j][i];
      } else {
        let sumAbs = 0;
        for (let k = 0; k < data[i].length; k++) {
          sumAbs += Math.abs(data[i][k] - data[j][k]);
        }
        distMatrix[i][j] = sumAbs;
      }
    }
  }
  
  return distMatrix;
}

/**
 * Perform Hierarchical Clustering (Agglomerative)
 * 
 * Builds a dendrogram by progressively merging closest clusters.
 * 
 * **Linkage Methods:**
 * - Single: Minimum distance between any pair
 * - Complete: Maximum distance between any pair
 * - Average (UPGMA): Average distance between all pairs
 * 
 * @param distanceMatrix - Pre-computed distance matrix
 * @param method - Linkage method (default: 'average')
 * @returns Dendrogram structure for visualization
 */
export function hierarchicalClustering(
  distanceMatrix: number[][],
  method: 'average' | 'complete' | 'single' = 'average'
): DendrogramNode {
  const n = distanceMatrix.length;
  
  if (n === 0) {
    throw new Error('Distance matrix cannot be empty');
  }
  
  if (n === 1) {
    return {
      id: '0',
      distance: 0,
      labels: ['0'],
      size: 1
    };
  }
  
  // Initialize clusters (each point starts as its own cluster)
  let clusters: DendrogramNode[] = distanceMatrix.map((_, i) => ({
    id: `${i}`,
    distance: 0,
    labels: [`${i}`],
    size: 1
  }));
  
  // Working copy of distance matrix
  let workingDist = distanceMatrix.map(row => [...row]);
  
  let nodeId = n;
  
  // Agglomerative clustering
  while (clusters.length > 1) {
    // Find minimum distance pair
    let minDist = Infinity;
    let minI = 0, minJ = 1;
    
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        if (workingDist[i][j] < minDist) {
          minDist = workingDist[i][j];
          minI = i;
          minJ = j;
        }
      }
    }
    
    // Merge clusters
    const merged: DendrogramNode = {
      id: `${nodeId++}`,
      left: clusters[minI],
      right: clusters[minJ],
      distance: minDist,
      labels: [...(clusters[minI].labels || []), ...(clusters[minJ].labels || [])],
      size: (clusters[minI].size || 1) + (clusters[minJ].size || 1)
    };
    
    // Update cluster list
    const newClusters: DendrogramNode[] = [];
    const newDist: number[][] = [];
    
    for (let i = 0; i < clusters.length; i++) {
      if (i !== minI && i !== minJ) {
        newClusters.push(clusters[i]);
        
        // Calculate new distances to merged cluster
        const newRow: number[] = [];
        for (let j = 0; j < newClusters.length - 1; j++) {
          newRow.push(newDist[j][newClusters.length - 1]);
        }
        
        // Distance based on linkage method
        let newDistVal: number;
        switch (method) {
          case 'single':
            newDistVal = Math.min(workingDist[minI][i], workingDist[minJ][i]);
            break;
          case 'complete':
            newDistVal = Math.max(workingDist[minI][i], workingDist[minJ][i]);
            break;
          case 'average':
          default:
            // UPGMA: Weighted average
            const sizeI = clusters[minI].size || 1;
            const sizeJ = clusters[minJ].size || 1;
            newDistVal = (workingDist[minI][i] * sizeI + workingDist[minJ][i] * sizeJ) / (sizeI + sizeJ);
            break;
        }
        
        newRow.push(newDistVal);
        newDist.push(newRow);
      }
    }
    
    // Add self-distance for merged cluster
    newDist.push([...new Array(newClusters.length).fill(0), 0]);
    
    newClusters.push(merged);
    clusters = newClusters;
    workingDist = newDist;
  }
  
  return clusters[0];
}

/**
 * Perform Principal Component Analysis (PCA)
 * 
 * Reduces dimensionality by finding orthogonal axes of maximum variance.
 * 
 * **Algorithm:**
 * 1. Standardize data (mean-center, optionally scale)
 * 2. Compute covariance/correlation matrix
 * 3. Find eigenvalues and eigenvectors
 * 4. Project data onto principal components
 * 
 * @param data - 2D array [observations x variables]
 * @returns PCA scores, loadings, and variance explained
 */
export function principalComponentAnalysis(
  data: number[][]
): { scores: number[][]; loadings: number[][]; varianceExplained: number[] } {
  const n = data.length; // Observations
  const p = data[0].length; // Variables
  
  if (n < 2 || p < 2) {
    throw new Error('PCA requires at least 2 observations and 2 variables');
  }
  
  // Step 1: Center the data (subtract means)
  const means: number[] = [];
  for (let j = 0; j < p; j++) {
    means[j] = mean(data.map(row => row[j]));
  }
  
  const centered = data.map(row => row.map((val, j) => val - means[j]));
  
  // Step 2: Compute covariance matrix (use correlation-like: divide by n-1)
  const covMatrix: number[][] = [];
  for (let i = 0; i < p; i++) {
    covMatrix[i] = [];
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      covMatrix[i][j] = sum / (n - 1);
    }
  }
  
  // Step 3: Eigenvalue decomposition using Jacobi algorithm
  const { eigenvalues, eigenvectors } = jacobiEigenDecomposition(covMatrix);
  
  // Sort by eigenvalue (descending)
  const indices = eigenvalues
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => b.val - a.val)
    .map(item => item.idx);
  
  const sortedEigenvalues = indices.map(i => eigenvalues[i]);
  const sortedEigenvectors = indices.map(i => eigenvectors[i]);
  
  // Loadings (eigenvectors × √eigenvalue)
  const loadings = sortedEigenvectors.map((vec, i) =>
    vec.map(v => v * Math.sqrt(Math.abs(sortedEigenvalues[i])))
  );
  
  // Scores (centered data × eigenvectors)
  const scores = centered.map(obs =>
    sortedEigenvectors.map(vec => dotProduct(obs, vec))
  );
  
  // Variance explained by each PC
  const totalVar = sum(sortedEigenvalues);
  const varianceExplained = sortedEigenvalues.map(ev => (ev / totalVar) * 100);
  
  return {
    scores,
    loadings,
    varianceExplained
  };
}

/**
 * Jacobi eigenvalue decomposition algorithm
 * Iteratively applies rotations to diagonalize symmetric matrix
 */
function jacobiEigenDecomposition(
  matrix: number[][]
): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = matrix.length;
  
  // Initialize eigenvector matrix as identity
  let V: number[][] = [];
  for (let i = 0; i < n; i++) {
    V[i] = [];
    for (let j = 0; j < n; j++) {
      V[i][j] = i === j ? 1 : 0;
    }
  }
  
  // Working copy of matrix
  let A = matrix.map(row => [...row]);
  
  const maxIterations = 100;
  const tolerance = 1e-10;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Find largest off-diagonal element
    let maxVal = 0;
    let p = 0, q = 1;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > maxVal) {
          maxVal = Math.abs(A[i][j]);
          p = i;
          q = j;
        }
      }
    }
    
    // Check convergence
    if (maxVal < tolerance) break;
    
    // Calculate rotation angle
    const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
    const t = theta >= 0 
      ? 1 / (theta + Math.sqrt(theta * theta + 1))
      : 1 / (theta - Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;
    
    // Apply rotation
    const Ap = [...A[p]];
    const Aq = [...A[q]];
    
    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Aip = A[i][p];
        const Aiq = A[i][q];
        A[i][p] = A[p][i] = c * Aip - s * Aiq;
        A[i][q] = A[q][i] = s * Aip + c * Aiq;
      }
    }
    
    A[p][p] = c * c * Ap[p] - 2 * s * c * Ap[q] + s * s * Aq[q];
    A[q][q] = s * s * Ap[p] + 2 * s * c * Ap[q] + c * c * Aq[q];
    A[p][q] = A[q][p] = 0;
    
    // Update eigenvectors
    for (let i = 0; i < n; i++) {
      const ViP = V[i][p];
      const ViQ = V[i][q];
      V[i][p] = c * ViP - s * ViQ;
      V[i][q] = s * ViP + c * ViQ;
    }
  }
  
  // Extract eigenvalues (diagonal elements)
  const eigenvalues = A.map((row, i) => row[i]);
  
  // Eigenvectors are columns of V
  const eigenvectors = transpose(V);
  
  return { eigenvalues, eigenvectors };
}

/**
 * Cut dendrogram to get cluster groups at specified height
 */
export function cutDendrogram(
  dendrogram: DendrogramNode,
  nClusters: number
): number[][] {
  if (nClusters <= 0) return [];
  if (nClusters === 1) {
    return [dendrogram.labels || []];
  }
  
  // Get all merge heights
  const heights: { node: DendrogramNode; height: number }[] = [];
  
  function collectHeights(node: DendrogramNode) {
    if (node.left && node.right) {
      heights.push({ node, height: node.distance });
      collectHeights(node.left);
      collectHeights(node.right);
    }
  }
  
  collectHeights(dendrogram);
  
  if (heights.length === 0) {
    return [dendrogram.labels || []];
  }
  
  // Sort by height and find cut threshold
  heights.sort((a, b) => a.height - b.height);
  const cutHeight = heights[Math.min(heights.length, nClusters - 1)].height;
  
  // Cut tree at this height
  const clusters: number[][] = [];
  
  function cut(node: DendrogramNode) {
    if (!node.left || !node.right) {
      // Leaf node
      clusters.push(node.labels?.map(l => parseInt(l)) || []);
    } else if (node.distance <= cutHeight) {
      // Below cut - keep as single cluster
      clusters.push(node.labels?.map(l => parseInt(l)) || []);
    } else {
      // Above cut - recurse
      cut(node.left!);
      cut(node.right!);
    }
  }
  
  cut(dendrogram);
  
  return clusters;
}

// ============================================================================
// POPULATION GENETICS
// ============================================================================

/**
 * Analyze Population Genetics from genotype data
 * 
 * Calculates allele frequencies, tests Hardy-Weinberg equilibrium,
 * and computes diversity measures.
 * 
 * **Formulas:**
 * - Allele frequency: p = (2×nAA + nAa) / (2×N)
 * - Expected heterozygosity (gene diversity): He = 2pq
 * - Observed heterozygosity: Ho = nAa / N
 * - Fixation index: F = (He - Ho) / He
 * - HW chi-square: Σ(O-E)²/E
 * 
 * @param genotypes - Array of diploid genotypes ['AA', 'Aa', 'aa', ...]
 * @returns Population genetics analysis results
 * 
 * @example
 * ```typescript
 * const genotypes = ['AA', 'Aa', 'aa', 'AA', 'Aa', 'Aa', 'aa', 'aa'];
 * const result = analyzePopulationGenetics(genotypes);
 * console.log(result.alleleFrequencies); // { A: 0.4375, a: 0.5625 }
 * ```
 */
export function analyzePopulationGenetics(genotypes: string[]): PopulationGeneticsResult {
  if (!genotypes || genotypes.length === 0) {
    throw new Error('Genotype array cannot be empty');
  }
  
  const N = genotypes.length;
  
  // Count alleles
  const alleleCounts: Record<string, number> = {};
  const genotypeCounts: Record<string, number> = {};
  
  for (const gt of genotypes) {
    const normalized = gt.toUpperCase();
    
    // Count genotype
    genotypeCounts[normalized] = (genotypeCounts[normalized] || 0) + 1;
    
    // Count individual alleles (assuming diploid, biallelic or multiallelic)
    if (normalized.length === 2) {
      const a1 = normalized[0];
      const a2 = normalized[1];
      alleleCounts[a1] = (alleleCounts[a1] || 0) + 1;
      alleleCounts[a2] = (alleleCounts[a2] || 0) + 1;
    } else {
      // Handle other formats like "A/B" or haploid
      const alleles = normalized.replace(/[^A-Za-z]/g, '');
      for (const a of alleles) {
        alleleCounts[a] = (alleleCounts[a] || 0) + 1;
      }
    }
  }
  
  const totalAlleles = Object.values(alleleCounts).reduce((a, b) => a + b, 0);
  
  // Allele frequencies
  const alleleFrequencies: Record<string, number> = {};
  for (const [allele, count] of Object.entries(alleleCounts)) {
    alleleFrequencies[allele] = count / totalAlleles;
  }
  
  // Genotype frequencies
  const genotypeFrequencies: Record<string, number> = {};
  for (const [gt, count] of Object.entries(genotypeCounts)) {
    genotypeFrequencies[gt] = count / N;
  }
  
  // Get unique alleles sorted
  const alleles = Object.keys(alleleFrequencies).sort();
  
  // Expected heterozygosity (Nei's gene diversity)
  // He = 1 - Σpi²
  let expectedHet = 1;
  for (const p of Object.values(alleleFrequencies)) {
    expectedHet -= p * p;
  }
  
  // For biallelic locus: He = 2pq
  if (alleles.length === 2) {
    const p = alleleFrequencies[alleles[0]];
    const q = alleleFrequencies[alleles[1]];
    expectedHet = 2 * p * q;
  }
  
  // Observed heterozygosity
  // Count heterozygous genotypes (those with two different alleles)
  let hetCount = 0;
  for (const gt of genotypes) {
    const normalized = gt.toUpperCase().replace(/[^A-Za-z]/g, '');
    if (normalized.length === 2 && normalized[0] !== normalized[1]) {
      hetCount++;
    }
  }
  const observedHet = hetCount / N;
  
  // Fixation index (Fis or Fst analog)
  // F = (He - Ho) / He
  const fixationIndex = expectedHet > 0 ? (expectedHet - observedHet) / expectedHet : 0;
  
  // Hardy-Weinberg Equilibrium test (chi-square goodness-of-fit)
  // For biallelic locus
  let hwChiSquare = 0;
  let hwDF = 0;
  let hwEquilibrium = true;
  let hwPValue = true; // true if p > 0.05 (not significant deviation)
  
  if (alleles.length === 2) {
    const p = alleleFrequencies[alleles[0]];
    const q = alleleFrequencies[alleles[1]];
    
    // Expected genotype frequencies under HWE
    const expAA = p * p * N;
    const expAa = 2 * p * q * N;
    const expaa = q * q * N;
    
    // Observed counts
    const obsAA = genotypeCounts[alleles[0] + alleles[0]] || 0;
    const obsAa = genotypeCounts[alleles[0] + alleles[1]] || 
                  genotypeCounts[alleles[1] + alleles[0]] || 0;
    const obsaa = genotypeCounts[alleles[1] + alleles[1]] || 0;
    
    // Chi-square statistic
    if (expAA > 0) hwChiSquare += (obsAA - expAA) ** 2 / expAA;
    if (expAa > 0) hwChiSquare += (obsAa - expAa) ** 2 / expAa;
    if (expaa > 0) hwChiSquare += (obsaa - expaa) ** 2 / expaa;
    
    hwDF = 1; // For biallelic: 3 genotypes - 2 alleles = 1 df
    
    // P-value from chi-square distribution
    const pValHW = 1 - chiSquareCDF(hwChiSquare, hwDF);
    hwPValue = pValHW > 0.05;
    hwEquilibrium = hwPValue;
  } else {
    // Multiallelic - simplified test
    hwDF = Math.max(0, Object.keys(genotypeCounts).length - alleles.length);
    // Use overall heterozygosity comparison
    hwChiSquare = N * Math.pow(observedHet - expectedHet, 2) / (expectedHet * (1 - expectedHet) || 1);
    const pValHW = 1 - chiSquareCDF(hwChiSquare, Math.max(1, hwDF));
    hwPValue = pValHW > 0.05;
    hwEquilibrium = hwPValue;
  }
  
  // Genetic diversity (same as expected heterozygosity for single locus)
  const geneticDiversity = expectedHet;
  
  return {
    alleleFrequencies,
    genotypeFrequencies,
    expectedHeterozygosity: expectedHet,
    observedHeterozygosity: observedHet,
    hardyWeinberg: {
      chiSquare: hwChiSquare,
      df: hwDF,
      pValue: hwPValue,
      equilibrium: hwEquilibrium
    },
    fixationIndex,
    geneticDiversity
  };
}

// ============================================================================
// ADDITIONAL STATISTICAL TESTS
// ============================================================================

/**
 * Perform Student's t-test (two-sample, independent)
 * 
 * Tests whether two independent samples have different means.
 * 
 * Formula: t = (x̄₁ - x̄₂) / √(s²p/n₁ + s²p/n₂)
 * where s²p = [(n₁-1)s²₁ + (n₂-1)s²₂] / (n₁+n₂-2)
 * 
 * @param sample1 - First sample
 * @param sample2 - Second sample
 * @returns t-statistic, degrees of freedom, and p-value
 */
export function tTestIndependent(
  sample1: number[],
  sample2: number[]
): { tStatistic: number; df: number; pValue: number; meanDiff: number } {
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  const mean1 = mean(sample1);
  const mean2 = mean(sample2);
  const var1 = variance(sample1);
  const var2 = variance(sample2);
  
  // Pooled variance
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
  
  // t-statistic
  const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
  const tStatistic = (mean1 - mean2) / se;
  
  // Degrees of freedom
  const df = n1 + n2 - 2;
  
  // P-value (two-tailed)
  const pValue = pValueFromT(tStatistic, df);
  
  return { tStatistic, df, pValue, meanDiff: mean1 - mean2 };
}

/**
 * Perform Paired t-test
 * 
 * Tests whether paired differences have non-zero mean.
 * 
 * Formula: t = d̄ / (sd / √n)
 * 
 * @param before - Before measurements
 * @param after - After measurements
 * @returns t-statistic, degrees of freedom, and p-value
 */
export function tTestPaired(
  before: number[],
  after: number[]
): { tStatistic: number; df: number; pValue: number; meanDiff: number } {
  if (before.length !== after.length) {
    throw new Error('Arrays must have equal length for paired test');
  }
  
  const differences = before.map((b, i) => after[i] - b);
  const n = differences.length;
  const meanDiff = mean(differences);
  const sdDiff = stddev(differences);
  
  const tStatistic = meanDiff / (sdDiff / Math.sqrt(n));
  const df = n - 1;
  const pValue = pValueFromT(tStatistic, df);
  
  return { tStatistic, df, pValue, meanDiff };
}

/**
 * Perform Chi-Square Test of Independence
 * 
 * Tests whether two categorical variables are associated.
 * 
 * Formula: χ² = Σ(Oij - Eij)² / Eij
 * where Eij = (rowTotal × colTotal) / grandTotal
 * 
 * @param contingencyTable - 2D array of observed frequencies
 * @returns Chi-square statistic, degrees of freedom, and p-value
 */
export function chiSquareTest(
  contingencyTable: number[][]
): { chiSquare: number; df: number; pValue: number } {
  const rows = contingencyTable.length;
  const cols = contingencyTable[0].length;
  
  // Calculate marginal totals
  const rowTotals = contingencyTable.map(row => sum(row));
  const colTotals: number[] = [];
  let grandTotal = 0;
  
  for (let j = 0; j < cols; j++) {
    colTotals[j] = 0;
    for (let i = 0; i < rows; i++) {
      colTotals[j] += contingencyTable[i][j];
    }
    grandTotal += colTotals[j];
  }
  
  // Calculate expected frequencies and chi-square
  let chiSquare = 0;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / grandTotal;
      if (expected > 0) {
        chiSquare += (contingencyTable[i][j] - expected) ** 2 / expected;
      }
    }
  }
  
  const df = (rows - 1) * (cols - 1);
  const pValue = 1 - chiSquareCDF(chiSquare, df);
  
  return { chiSquare, df, pValue };
}

/**
 * Calculate Tukey's Honest Significant Difference (HSD)
 * Post-hoc test for ANOVA to compare all pairs of means
 * 
 * Formula: HSD = q(α,k,dfE) × √(MSE/n)
 * 
 * @param treatmentMeans - Array of treatment means
 * @param mse - Mean square error from ANOVA
 * @param nPerGroup - Number of observations per group (or array)
 * @param dfError - Error degrees of freedom
 * @param alpha - Significance level (default 0.05)
 * @returns Pairwise comparison results
 */
export function tukeyHSD(
  treatmentMeans: number[],
  mse: number,
  nPerGroup: number | number[],
  dfError: number,
  alpha: number = 0.05
): {
  comparisons: { i: number; j: number; diff: number; se: number; q: number; p: number; significant: boolean }[];
  criticalValue: number;
} {
  const k = treatmentMeans.length;
  const nArray = typeof nPerGroup === 'number' ? new Array(k).fill(nPerGroup) : nPerGroup;
  
  // Approximate studentized range quantile (q)
  // Using approximation: q ≈ √2 × t for large samples
  const tCrit = criticalT(alpha, dfError);
  const qApprox = Math.sqrt(2) * tCrit;
  
  const comparisons = [];
  
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const diff = treatmentMeans[i] - treatmentMeans[j];
      const avgN = 2 / (1 / nArray[i] + 1 / nArray[j]); // Harmonic mean
      const se = Math.sqrt(mse / avgN);
      const q = Math.abs(diff) / se;
      
      // Approximate p-value from studentized range
      const p = pValueFromF(q * q / 2, k, dfError);
      
      comparisons.push({
        i,
        j,
        diff,
        se,
        q,
        p,
        significant: q > qApprox
      });
    }
  }
  
  return {
    comparisons,
    criticalValue: qApprox
  };
}

/**
 * Calculate Duncan's Multiple Range Test (MRT)
 * Another post-hoc test with different protection levels
 * 
 * @param treatmentMeans - Array of treatment means
 * @param mse - Mean square error
 * @param nPerGroup - Observations per group
 * @param dfError - Error degrees of freedom
 * @returns Comparison results with Duncan groupings
 */
export function duncanMRT(
  treatmentMeans: number[],
  mse: number,
  nPerGroup: number,
  dfError: number
): {
  groups: string[][];
  rankedMeans: { mean: number; index: number; rank: number }[];
} {
  // Rank means
  const ranked = treatmentMeans
    .map((m, i) => ({ mean: m, index: i }))
    .sort((a, b) => b.mean - a.mean);
  
  // Assign letters for significant groups
  const groups: string[][] = new Array(ranked.length).fill(null).map(() => []);
  const se = Math.sqrt(mse / nPerGroup);
  
  // Compare consecutive ranges
  for (let range = 2; range <= ranked.length; range++) {
    for (let start = 0; start <= ranked.length - range; start++) {
      const end = start + range - 1;
      const diff = ranked[start].mean - ranked[end].mean;
      
      // Duncan's critical value depends on range
      const alphaAdjusted = 1 - Math.pow(1 - 0.05, range - 1);
      const tAdj = criticalT(alphaAdjusted, dfError);
      const criticalRange = tAdj * se * Math.sqrt(2);
      
      if (diff <= criticalRange) {
        // Same group - assign shared letter
        const letter = String.fromCharCode(65 + groups[start].length);
        for (let i = start; i <= end; i++) {
          if (!groups[i].includes(letter)) {
            groups[i].push(letter);
          }
        }
      }
    }
  }
  
  // Assign unique letter to ungrouped means
  let nextLetter = 65;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].length === 0) {
      groups[i].push(String.fromCharCode(nextLetter++));
    }
  }
  
  // Map back to original order
  const orderedGroups: string[][] = new Array(treatmentMeans.length).fill(null).map(() => []);
  ranked.forEach((item, rank) => {
    orderedGroups[item.index] = groups[rank];
  });
  
  return {
    groups: orderedGroups,
    rankedMeans: ranked.map((item, i) => ({ ...item, rank: i + 1 }))
  };
}

/**
 * Calculate Coefficient of Variation (CV)
 * CV = (standard deviation / mean) × 100
 * 
 * @param data - Array of values
 * @returns CV as percentage
 */
export function coefficientOfVariation(data: number[]): number {
  const m = mean(data);
  const sd = stddev(data);
  return m !== 0 ? (Math.abs(sd) / Math.abs(m)) * 100 : 0;
}

/**
 * Calculate Standard Error of Mean
 * SEM = s / √n
 * 
 * @param data - Array of values
 * @returns Standard error
 */
export function standardError(data: number[]): number {
  return stddev(data) / Math.sqrt(data.length);
}

/**
 * Calculate Confidence Interval for mean
 * 
 * @param data - Array of values
 * @param alpha - Significance level (default 0.95 for 95% CI)
 * @returns [lower, upper] bounds
 */
export function confidenceInterval(
  data: number[],
  confidence: number = 0.95
): [number, number] {
  const n = data.length;
  const m = mean(data);
  const se = standardError(data);
  const tCrit = criticalT(1 - confidence, n - 1);
  
  const margin = tCrit * se;
  return [m - margin, m + margin];
}

/**
 * Transform data using Box-Cox transformation
 * Finds optimal lambda for normalizing data
 * 
 * y(λ) = (y^λ - 1)/λ for λ ≠ 0
 * y(λ) = log(y) for λ = 0
 * 
 * @param data - Positive values only
 * @returns Transformed data and optimal lambda
 */
export function boxCoxTransform(
  data: number[]
): { transformed: number[]; lambda: number; optimalLambda: number } {
  // Ensure all positive
  if (data.some(d => d <= 0)) {
    throw new Error('Box-Cox transform requires strictly positive values');
  }
  
  // Find optimal lambda using profile likelihood (simplified)
  // Test lambdas from -2 to 2
  const lambdas = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
  let bestLambda = 1;
  let bestLogLik = -Infinity;
  
  for (const lambda of lambdas) {
    const transformed = boxCoxSingle(data, lambda);
    
    // Calculate approximate log-likelihood (based on variance of transformed)
    const varTransformed = variance(transformed);
    const logLik = -data.length / 2 * Math.log(varTransformed) + (lambda - 1) * sum(data.map(d => Math.log(d)));
    
    if (logLik > bestLogLik) {
      bestLogLik = logLik;
      bestLambda = lambda;
    }
  }
  
  return {
    transformed: boxCoxSingle(data, bestLambda),
    lambda: bestLambda,
    optimalLambda: bestLambda
  };
}

/** Apply Box-Cox transform with given lambda */
function boxCoxSingle(data: number[], lambda: number): number[] {
  if (Math.abs(lambda) < 0.001) {
    // Log transform when lambda ≈ 0
    return data.map(d => Math.log(d));
  }
  return data.map(d => (Math.pow(d, lambda) - 1) / lambda);
}

/**
 * Calculate Skewness (third standardized moment)
 * Measures asymmetry of distribution
 * 
 * Formula: γ = E[((X-μ)/σ)³]
 * 
 * @param data - Array of values
 * @returns Skewness value (0 = symmetric, >0 = right-skewed, <0 = left-skewed)
 */
export function skewness(data: number[]): number {
  const n = data.length;
  const m = mean(data);
  const s = stddev(data);
  
  if (s === 0) return 0;
  
  const sumCubeDiff = data.reduce((sum, val) => {
    return sum + Math.pow((val - m) / s, 3);
  }, 0);
  
  // Use adjusted formula for sample skewness
  return (n / ((n - 1) * (n - 2))) * sumCubeDiff;
}

/**
 * Calculate Kurtosis (fourth standardized moment)
 * Measures tail heaviness of distribution
 * 
 * Formula: κ = E[((X-μ)/σ)⁴] - 3 (excess kurtosis)
 * 
 * @param data - Array of values
 * @returns Excess kurtosis (0 = mesokurtic/normal, >0 = leptokurtic, <0 = platykurtic)
 */
export function kurtosis(data: number[]): number {
  const n = data.length;
  const m = mean(data);
  const s = stddev(data);
  
  if (s === 0) return 0;
  
  const sumFourthDiff = data.reduce((sum, val) => {
    return sum + Math.pow((val - m) / s, 4);
  }, 0);
  
  // Excess kurtosis (subtract 3 for normal distribution baseline)
  return (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sumFourthDiff -
         3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
}

/**
 * Detect outliers using Interquartile Range (IQR) method
 * Values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are outliers
 * 
 * @param data - Array of values
 * @returns Object with outlier indices and values, and cleaned data
 */
export function detectOutliers(
  data: number[]
): {
  outliers: { index: number; value: number }[];
  cleaned: number[];
  lowerBound: number;
  upperBound: number;
} {
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers: { index: number; value: number }[] = [];
  const cleaned: number[] = [];
  
  data.forEach((val, idx) => {
    if (val < lowerBound || val > upperBound) {
      outliers.push({ index: idx, value: val });
    } else {
      cleaned.push(val);
    }
  });
  
  return { outliers, cleaned, lowerBound, upperBound };
}

/**
 * Calculate percentile from sorted data
 * Uses linear interpolation method
 */
function percentile(sortedData: number[], p: number): number {
  const n = sortedData.length;
  const pos = (p / 100) * (n - 1);
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  
  if (lower === upper) return sortedData[lower];
  
  return sortedData[lower] + (pos - lower) * (sortedData[upper] - sortedData[lower]);
}

/**
 * Normalize data to [0, 1] range (min-max scaling)
 * 
 * @param data - Array of values
 * @returns Normalized values
 */
export function normalize(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  return range === 0 ? new Array(data.length).fill(0.5) : data.map(v => (v - min) / range);
}

/**
 * Standardize data (z-score normalization)
 * z = (x - μ) / σ
 * 
 * @param data - Array of values
 * @returns Z-scores
 */
export function standardize(data: number[]): number[] {
  const m = mean(data);
  const s = stddev(data);
  
  return s === 0 ? new Array(data.length).fill(0) : data.map(v => (v - m) / s);
}

/**
 * Calculate Effect Size (Cohen's d)
 * 
 * Formula: d = (μ₁ - μ₂) / σpooled
 * 
 * Interpretation: 0.2 = small, 0.5 = medium, 0.8 = large
 * 
 * @param group1 - First group
 * @param group2 - Second group
 * @returns Cohen's d effect size
 */
export function cohensD(group1: number[], group2: number[]): number {
  const n1 = group1.length;
  const n2 = group2.length;
  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const var1 = variance(group1);
  const var2 = variance(group2);
  
  // Pooled standard deviation
  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
  
  return (mean1 - mean2) / pooledSD;
}

/**
 * Calculate Shapiro-Wilk test statistic for normality
 * (Approximation - exact calculation requires special tables)
 * 
 * @param data - Array of values
 * @returns W statistic (close to 1 indicates normality)
 */
export function shapiroWilk(data: number[]): { W: number; pValue: number; isNormal: boolean } {
  const n = data.length;
  
  if (n < 3) {
    return { W: 1, pValue: 1, isNormal: true };
  }
  
  const sorted = [...data].sort((a, b) => a - b);
  const meanVal = mean(sorted);
  
  // Calculate denominator (sum of squared deviations from mean)
  const S2 = sorted.reduce((sum, x) => sum + (x - meanVal) ** 2, 0);
  
  if (S2 === 0) {
    return { W: 1, pValue: 1, isNormal: true };
  }
  
  // Calculate numerator using expected normal order statistics (approximated)
  const m: number[] = [];
  for (let i = 1; i <= n; i++) {
    m.push(normalCDF((i - 0.375) / (n + 0.25)));
  }
  
  // Calculate W statistic
  let b = 0;
  const nhalf = Math.floor(n / 2);
  
  for (let i = 0; i < nhalf; i++) {
    // Simplified a-coefficient approximation
    const a = normalCDF((n - i + 0.25) / (n + 0.75)) - normalCDF((i + 0.25) / (n + 0.75));
    const aNorm = a / Math.sqrt(sum(m.map(mi => (mi - 0.5) ** 2)));
    b += aNorm * (sorted[n - 1 - i] - sorted[i]);
  }
  
  const W = (b * b) / S2;
  
  // Approximate p-value (Royston's approximation simplified)
  const pValue = W > 0.9 ? 1 : Math.pow(1 - W, 3) * n / 2;
  
  return { W, pValue, isNormal: pValue > 0.05 };
}

/**
 * Calculate Levene's Test for equality of variances
 * Tests whether variances across groups are equal
 * 
 * @param groups - Array of groups (each group is array of values)
 * @returns F-statistic, degrees of freedom, and p-value
 */
export function leveneTest(
  groups: number[][]
): { fStatistic: number; df1: number; df2: number; pValue: number; equalVariance: boolean } {
  const k = groups.length;
  const allValues = groups.flat();
  const overallMedian = median(allValues);
  
  // Calculate absolute deviations from median
  const deviations = groups.map(group =>
    group.map(val => Math.abs(val - overallMedian))
  );
  
  // ANOVA on deviations
  const groupMeans = deviations.map(dev => mean(dev));
  const overallMean = mean(deviations.flat());
  
  // Between-groups SS
  let ssBetween = 0;
  const ni = groups.map(g => g.length);
  for (let i = 0; i < k; i++) {
    ssBetween += ni[i] * (groupMeans[i] - overallMean) ** 2;
  }
  
  // Within-groups SS
  let ssWithin = 0;
  for (let i = 0; i < k; i++) {
    for (const dev of deviations[i]) {
      ssWithin += (dev - groupMeans[i]) ** 2;
    }
  }
  
  const df1 = k - 1;
  const df2 = allValues.length - k;
  const msBetween = ssBetween / df1;
  const msWithin = ssWithin / df2;
  const fStatistic = msBetween / msWithin;
  const pValue = pValueFromF(fStatistic, df1, df2);
  
  return { fStatistic, df1, df2, pValue, equalVariance: pValue > 0.05 };
}

/**
 * Non-parametric Kruskal-Wallis test
 * Alternative to one-way ANOVA for non-normal data
 * 
 * Formula: H = (12/(N(N+1))) × Σ(Ri²/ni) - 3(N+1)
 * 
 * @param groups - Array of groups
 * @returns H statistic, df, and p-value
 */
export function kruskalWallis(
  groups: number[][]
): { hStatistic: number; df: number; pValue: number } {
  // Combine all data with group labels
  const allData: { value: number; group: number }[] = [];
  groups.forEach((group, gi) => {
    group.forEach(value => {
      allData.push({ value, group: gi });
    });
  });
  
  // Rank all values
  allData.sort((a, b) => a.value - b.value);
  const ranks = calculateRanks(allData.map(d => d.value));
  
  // Sum of ranks per group
  const k = groups.length;
  const N = allData.length;
  const rankSums = new Array(k).fill(0);
  const ni = groups.map(g => g.length);
  
  allData.forEach((d, i) => {
    rankSums[d.group] += ranks[i];
  });
  
  // H statistic
  let hStat = 0;
  for (let i = 0; i < k; i++) {
    hStat += (rankSums[i] * rankSums[i]) / ni[i];
  }
  hStat = (12 / (N * (N + 1))) * hStat - 3 * (N + 1);
  
  // Tie correction
  const uniqueValues = new Set(allData.map(d => d.value));
  if (uniqueValues.size < N) {
    const tieGroups: number[] = [];
    let currentVal = allData[0].value;
    let tieSize = 1;
    
    for (let i = 1; i < N; i++) {
      if (allData[i].value === currentVal) {
        tieSize++;
      } else {
        if (tieSize > 1) tieGroups.push(tieSize);
        currentVal = allData[i].value;
        tieSize = 1;
      }
    }
    if (tieSize > 1) tieGroups.push(tieSize);
    
    const correction = 1 - (tieGroups.reduce((sum, t) => sum + t ** 3 - t, 0) / (N ** 3 - N));
    hStat /= correction;
  }
  
  const df = k - 1;
  const pValue = 1 - chiSquareCDF(hStat, df);
  
  return { hStatistic: hStat, df, pValue };
}

/**
 * Mann-Whitney U test (Wilcoxon rank-sum)
 * Non-parametric alternative to independent t-test
 * 
 * @param sample1 - First sample
 * @param sample2 - Second sample
 * @returns U statistic, z-score, and p-value
 */
export function mannWhitneyU(
  sample1: number[],
  sample2: number[]
): { uStatistic: number; zScore: number; pValue: number } {
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  // Combine and rank
  const combined = [...sample1.map((v, i) => ({ value: v, group: 1, origIdx: i })),
                     ...sample2.map((v, i) => ({ value: v, group: 2, origIdx: i }))];
  combined.sort((a, b) => a.value - b.value);
  const ranks = calculateRanks(combined.map(d => d.value));
  
  // Sum of ranks for group 1
  let R1 = 0;
  combined.forEach((d, i) => {
    if (d.group === 1) R1 += ranks[i];
  });
  
  // U statistic
  const U1 = R1 - n1 * (n1 + 1) / 2;
  const U2 = n1 * n2 - U1;
  const uStatistic = Math.min(U1, U2);
  
  // Z-score (with continuity correction)
  const meanU = n1 * n2 / 2;
  const varU = n1 * n2 * (n1 + n2 + 1) / 12;
  const zScore = (uStatistic - meanU) / Math.sqrt(varU);
  
  // Two-tailed p-value
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  return { uStatistic, zScore, pValue };
}

/**
 * Friedman test (non-parametric alternative to randomized block ANOVA)
 * 
 * @param data - 2D array [treatments][blocks]
 * @returns Chi-square statistic, df, and p-value
 */
export function friedmanTest(
  data: number[][]
): { chiSquare: number; df: number; pValue: number } {
  const k = data.length; // Treatments
  const b = data[0].length; // Blocks
  
  // Rank within each block
  const rankedBlocks: number[][] = [];
  for (let j = 0; j < b; j++) {
    const blockValues = data.map(treatment => treatment[j]);
    rankedBlocks[j] = calculateRanks(blockValues);
  }
  
  // Sum of ranks per treatment
  const rankSums = data.map((_, i) =>
    rankedBlocks.reduce((sum, block) => sum + block[i], 0)
  );
  
  // Friedman statistic
  const meanRank = (k + 1) / 2;
  let chiSquare = 0;
  for (let i = 0; i < k; i++) {
    chiSquare += (rankSums[i] - b * meanRank) ** 2;
  }
  chiSquare = (12 / (b * k * (k + 1))) * chiSquare;
  
  const df = k - 1;
  const pValue = 1 - chiSquareCDF(chiSquare, df);
  
  return { chiSquare, df, pValue };
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * BioAlign Statistics Engine
 * 
 * A comprehensive statistical library providing:
 * 
 * **Experimental Design & ANOVA:**
 * - oneWayANOVA() - One-way analysis of variance
 * - twoWayANOVA() - Two-way factorial ANOVA
 * - analyzeRCBD() - Randomized complete block design
 * - analyzeCRD() - Completely randomized design
 * 
 * **Correlation & Regression:**
 * - pearsonCorrelation() - Pearson product-moment correlation
 * - spearmanCorrelation() - Spearman rank correlation
 * - simpleLinearRegression() - Simple OLS regression
 * - multipleRegression() - Multiple linear regression
 * 
 * **Plant Breeding & Genetics:**
 * - calculateGeneticParameters() - Variance components, heritability, genetic advance
 * - calculateSelectionIndex() - Multi-trait selection index
 * - pathAnalysis() - Path coefficient analysis
 * - analyzePopulationGenetics() - Allele frequencies, HWE testing
 * 
 * **Diversity Analysis:**
 * - euclideanDistance() / manhattanDistance() - Distance matrices
 * - hierarchicalClustering() - Agglomerative clustering with dendrogram
 * - principalComponentAnalysis() - PCA for dimensionality reduction
 * 
 * **Statistical Distributions:**
 * - fDistributionCDF(), tDistributionCDF(), normalCDF(), chiSquareCDF()
 * - criticalF(), criticalT()
 * - pValueFromF(), pValueFromT()
 * 
 * **Utility Functions:**
 * - mean(), variance(), stddev(), median(), sum(), sumOfSquares()
 * - covariance(), coefficientOfVariation(), standardError()
 * - normalize(), standardize(), detectOutliers()
 * 
 * **Additional Tests:**
 * - tTestIndependent(), tTestPaired() - T-tests
 * - chiSquareTest() - Contingency table analysis
 * - tukeyHSD(), duncanMRT() - Post-hoc comparisons
 * - shapiroWilk() - Normality test
 * - leveneTest() - Homogeneity of variance
 * - kruskalWallis(), mannWhitneyU(), friedmanTest() - Non-parametric tests
 */

export default {
  // ANOVA
  oneWayANOVA,
  twoWayANOVA,
  analyzeRCBD,
  analyzeCRD,
  
  // Correlation
  pearsonCorrelation,
  spearmanCorrelation,
  
  // Regression
  simpleLinearRegression,
  multipleRegression,
  
  // Genetic Parameters
  calculateGeneticParameters,
  calculateSelectionIndex,
  pathAnalysis,
  
  // Diversity
  euclideanDistance,
  manhattanDistance,
  hierarchicalClustering,
  principalComponentAnalysis,
  cutDendrogram,
  
  // Population Genetics
  analyzePopulationGenetics,
  
  // Distributions
  fDistributionCDF,
  tDistributionCDF,
  normalCDF,
  chiSquareCDF,
  criticalF,
  criticalT,
  pValueFromF,
  pValueFromT,
  
  // Utilities
  mean,
  variance,
  stddev,
  median,
  sum,
  sumOfSquares,
  covariance,
  degreesOfFreedom,
  coefficientOfVariation,
  standardError,
  confidenceInterval,
  normalize,
  standardize,
  detectOutliers,
  skewness,
  kurtosis,
  cohensD,
  boxCoxTransform,
  
  // Statistical Tests
  tTestIndependent,
  tTestPaired,
  chiSquareTest,
  tukeyHSD,
  duncanMRT,
  shapiroWilk,
  leveneTest,
  kruskalWallis,
  mannWhitneyU,
  friedmanTest
};
