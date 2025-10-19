$userId = "816614f4-b6eb-4806-9e87-0ed87d62c317"
$baseUrl = "http://localhost:3001/api/v1/pantry"

$items = @(
    @{
        name = "Organic Milk"
        brand = "Horizon"
        quantity = 1
        unit = "gallons"
        category = "dairy"
        expirationDate = "2025-10-25"
        notes = "Whole milk"
    },
    @{
        name = "Fresh Strawberries"
        brand = "Driscolls"
        quantity = 1
        unit = "pounds"
        category = "produce"
        expirationDate = "2025-10-22"
    },
    @{
        name = "Whole Wheat Bread"
        quantity = 1
        unit = "packages"
        category = "bakery"
        expirationDate = "2025-10-28"
    },
    @{
        name = "Ground Beef"
        quantity = 2
        unit = "pounds"
        category = "meat"
        expirationDate = "2025-10-21"
    },
    @{
        name = "Eggs"
        quantity = 12
        unit = "pieces"
        category = "dairy"
        expirationDate = "2025-11-05"
    }
)

Write-Host "Adding test items to pantry..." -ForegroundColor Green
Write-Host ""

foreach ($item in $items) {
    $json = $item | ConvertTo-Json -Compress

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers @{"Content-Type"="application/json"; "x-user-id"=$userId} -Body $json

        Write-Host "Added: $($item.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to add: $($item.name)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Refresh your app to see the items." -ForegroundColor Cyan
