/**
 * Thrown when required driver's package is not installed.
 */
export class DriverPackageNotInstalledError extends Error {
    name = "DriverPackageNotInstalledError";

    constructor(driverName: string, packageName: string) {
        super();
        this.message = `${driverName} has not been found installed. Try to install it: ${packageName} --save`;

    }

}