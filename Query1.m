let
    // 1. Definir la URL base y los parámetros del BAQ
    BaseUrl = "https://centralusdtapp73.epicorsaas.com/SaaS5333/api/v1/BaqSvc/JJGF_PART_TRAN_CAMILO4/",
    
    // 2. Conexión OData
    // Usamos la opción 'Query' para pasar los parámetros requeridos por el BAQ (Fecha_Inicio/Fin)
    Source = OData.Feed(BaseUrl, null, [
        Implementation="2.0", 
        Query=[
            Fecha_Fin="2025-11-25", 
            Fecha_Inicio="2025-11-25"
        ]
    ]),

    // 3. Aplicar los filtros (Equivalente a tu cláusula WHERE)
    FilteredRows = Table.SelectRows(Source, each 
        ([PartTran_Plant] = "EMPAQUE") and 
        ([Calculated_Tipo] = "Movimiento") and 
        // Equivalente a IN ('STK-STK', 'MFG-STK')
        (List.Contains({"STK-STK", "MFG-STK"}, [PartTran_TranType])) and 
        // Equivalente a IN ('CONTEMP', 'MPEMP', 'MPEMPCH')
        (List.Contains({"CONTEMP", "MPEMP", "MPEMPCH"}, [PartTran_WareHouseCode])) and 
        ([Calculated_Qty] > 0) and 
        ([PartTran_PartNum] = "000230")
    ),

    // 4. Seleccionar las columnas necesarias
    // Nota: Incluí PartTran_Plant, Calculated_Tipo y PartNum ya que estaban en tu select original como '*' implícito o explícito
    SelectedColumns = Table.SelectColumns(FilteredRows, {
        "Calculated_Qty", 
        "PartTran_TranType", 
        "PartTran_WareHouseCode", 
        "PartTran_Plant", 
        "Calculated_Tipo", 
        "PartTran_PartNum"
    }),

    // 5. Renombrar columnas (Equivalente a SELECT Col AS Alias)
    RenamedColumns = Table.RenameColumns(SelectedColumns, {
        {"Calculated_Qty", "Cantidad"},
        {"PartTran_TranType", "Tipo"},
        {"PartTran_WareHouseCode", "almacen"}
    })
in
    RenamedColumns