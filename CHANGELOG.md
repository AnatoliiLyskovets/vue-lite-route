# Changelog

## 1.3.1 - 2024-10-15

### Fixed

- Add re-export for all the core contracts

## 1.3.0 - 2024-10-15

### Added

- Add explicit type for `overwriteFields` in `registerModifier()` to better track changes in `Modifier` properties.
- Removed `_` prefixes in `RouteRegistrar` for better properties naming and readability.

### Changed

- Bumped main package versions (dev ones)
- Upgraded ESLint config (new flat config)

## 1.2.0 - 2022-11-18

### Added

- Add methods for force overwriting the `PreparedRouteRecord` properties: `forcePath()`, `forceMiddleware()`, `forceName()`, `clearMiddleware()`, `clearName()`
- Add return of prepared parent route instance from `childrenGroup()` method

## 1.1.0 - 2022-11-10

### Changed

- Remove the path normalization in routes and modifiers (no force `/` at the beginning of routes)

### Fixed

- Fix the problem with the incorrect children group registration (path overwrite)

## 1.0.1 - 2022-11-10

### Fixed

- Fix the problem with the `structuredClone()` usage during the modifier registration
- Fix typo in homepage url in package.json

## 1.0.0 - 2022-10-30
- Initial release
