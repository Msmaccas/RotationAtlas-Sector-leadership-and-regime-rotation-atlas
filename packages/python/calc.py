"""
This module provides heavy numerical calculations for RotationAtlas. It reads a CSV
of sector returns and computes correlation matrices or other matrix-heavy
operations. It can be invoked from Node via subprocess when needed.
"""

import argparse
import pandas as pd
import numpy as np


def compute_correlation_matrix(csv_path: str, output_path: str | None = None) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    # Exclude non-sector columns
    sector_cols = [c for c in df.columns if c not in ('date', 'benchmark')]
    corr = df[sector_cols].corr()
    if output_path:
        corr.to_csv(output_path)
    return corr


def main():
    parser = argparse.ArgumentParser(description='Compute correlation matrix of sector returns.')
    parser.add_argument('input', help='Path to sector_returns.csv')
    parser.add_argument('-o', '--output', help='Output CSV path', default=None)
    args = parser.parse_args()
    corr = compute_correlation_matrix(args.input, args.output)
    print(corr)


if __name__ == '__main__':
    main()