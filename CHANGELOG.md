# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1]

- Return false when numeric or string predicates cannot convert an operand to a primitive. Exceptions thrown by user code still propagate.

## [0.1.0]

- Validate built-in operand counts in condition trees and handle unsupported numeric and string conversion inputs.

- Add `guard` for batch registration and `is` for checking objects and values.
- Add named predicates, short-circuit condition evaluation, and named guard expansion.
