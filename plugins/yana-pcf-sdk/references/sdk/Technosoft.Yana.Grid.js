// ============================================
// YanaEditableGrid - Editable Grid Control Library
// ============================================

// Utility: Check if field type is a Lookup
const isLookupField = (type) => type.includes('Lookup');

// ============================================
// Cell Class - Represents a single grid cell
// ============================================
class Cell {
  constructor({
    schemaName,
    rowId,
    gridId,
    type,
    value,
    isRequired,
    isDisabled,
    isSystemDisabled,
    isReadOnly,
    readOnlyColumns,
  }) {
    this.schemaName = schemaName;
    this.rowId = rowId;
    this.gridId = gridId;
    this.type = type;
    this.value = value;
    this.isRequired = isRequired;
    this.isDisabled = isDisabled;
    this.isSystemDisabled = isSystemDisabled;
    this.isReadOnly = isReadOnly;
    this.readOnlyColumns = readOnlyColumns;
  }

  // Set cell value with validation
  setValue(newValue) {
    const requestId = Date.now().toString();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        //reject("Request timed out!");
      }, 6000);

      const messageHandler = (event) => {
        const response = JSON.parse(event.data);

        // Check if this is the response we're waiting for
        if (response.messageType === 'updateData' && response.requestId === requestId) {
          window.removeEventListener('message', messageHandler);
          clearTimeout(timeout);

          if (response.status) {
            // Success
            this.value = isLookupField(this.type) ? response.value : newValue;
            resolve(newValue);
          } else {
            // Validation error
            this.value = response.value;
            reject(`Validation Error: ${response?.errorMessage}`);
          }
        }
      };

      window.addEventListener('message', messageHandler);

      const valueToSend = isLookupField(this.type) ? newValue : newValue?.toString() || '';

      this.sendRequest('setValue', valueToSend, requestId);
    });
  }

  // Get cell value (converts DateAndTime to Date object)
  getValue() {
    if (this.value && this.type.includes('DateAndTime')) {
      return new Date(this.value);
    }
    return this.value || null;
  }

  // Set disabled state
  setDisabled(disabled) {
    if (this.isSystemDisabled) return;
    this.isDisabled = disabled;
    this.sendRequest('setDisabled', disabled);
  }

  // Get disabled state
  getDisabled() {
    return this.isDisabled;
  }

  // Set readonly state
  setReadOnly(readonly) {
    if (this.isSystemDisabled) return;
    this.isReadOnly = readonly;
    this.sendRequest('setReadOnly', readonly);
  }

  // Get readonly state
  getReadOnly() {
    return this.isReadOnly;
  }

  // Set required level ("required" or "none")
  setRequiredLevel(level) {
    if (this.isSystemDisabled) return;
    if (level !== 'required' && level !== 'none') return;

    this.isRequired = level == 'required' ? true : false;
    this.sendRequest('setRequired', this.isRequired);
  }

  // Get required level
  getRequiredLevel() {
    return this.isRequired;
  }

  // Set readonly columns state
  setReadOnlyColumns(readOnlyColumns) {
    this.readOnlyColumns = readOnlyColumns;
    this.sendRequest('setReadOnlyColumns', readOnlyColumns);
  }

  // Get readonly columns state
  getReadOnlyColumns() {
    return this.readOnlyColumns;
  }

  // Get field type
  getType() {
    return this.type;
  }

  // Get parent grid ID
  getEditableGridId() {
    return this.gridId;
  }

  // Add presearch filter for lookup fields
  addPreSearch(filter) {
    this.sendRequest('addPreSearch', filter);
  }

  // Remove presearch filter
  removePreSearch() {
    this.sendRequest('addPreSearch', '');
  }

  // Set notification message
  setNotification(message) {
    this.sendRequest('setNotification', message);
  }

  // Clear notification
  clearNotification() {
    this.sendRequest('setNotification', '');
  }

  // Internal: Send message to parent window
  sendRequest(messageType, value, requestId) {
    let message = {
      messageType,
      frameId: window.frameElement?.id || '',
      gridId: this.gridId,
      rowId: this.rowId,
      columnName: this.schemaName,
      value: this.value,
      isDisabled: this.isDisabled,
      isRequired: this.isRequired,
      isReadOnly: this.isReadOnly,
      requestId,
    };

    // Add specific properties based on message type
    if (messageType === 'setValue') {
      message = { ...message, value };
    } else if (messageType === 'addPreSearch') {
      message = { ...message, presearch: value };
    } else if (messageType === 'setDisabled') {
      message = { ...message, isDisabled: value };
    } else if (messageType === 'setReadOnly') {
      message = { ...message, isReadOnly: value };
    } else if (messageType === 'setRequired') {
      message = { ...message, isRequired: value };
    } else if (messageType === 'setReadOnlyColumns') {
      message = { ...message, readOnlyColumns: value };
    } else if (messageType === 'setNotification') {
      message = { ...message, notification: value };
    }

    window.top?.postMessage(JSON.stringify(message));
  }
}

// ============================================
// Row Class - Represents a grid row
// ============================================
class Row {
  constructor(rowId, cells) {
    this.rowId = rowId;
    this.cells = cells;
  }

  // Get cell by schema name
  getCell(schemaName) {
    return this.cells.find((cell) => cell.schemaName === schemaName);
  }
}

// ============================================
// ServiceBus - Event handling singleton
// ============================================
class ServiceBus {
  static _instance = null;

  constructor() {
    this._eventList = new Map();

    // Listen for messages from parent window
    window.addEventListener('message', (event) => {
      this.callHandler(event.data);
    });
  }

  // Subscribe to grid event
  subscribe(instance, gridId, eventName, eventFunction, eventParameter) {
    const events = this.getEventObject(gridId);
    events.push({
      instance,
      eventName,
      eventParameter,
      eventFunction,
    });
  }

  // Unsubscribe from grid event
  unsubscribe(gridId, eventName, eventFunction, eventParameter) {
    let events = this.getEventObject(gridId);

    events = events.filter((event) => {
      const nameMatch = event.eventName === eventName;
      const funcMatch = event.eventFunction === eventFunction;
      const paramMatch = eventParameter === undefined || eventParameter === event.eventParameter;
      return !(nameMatch && funcMatch && paramMatch);
    });

    this._eventList.set(gridId, events);
  }

  // Handle incoming messages
  async callHandler(data) {
    const message = JSON.parse(data);
    const validEvents = [
      'addOnLoad',
      'addOnNew',
      'addOnNewForm',
      'addOnQuickView',
      'addOnChange',
      'addOnSave',
    ];

    if (!validEvents.includes(message.eventName)) return;

    const events = this._eventList.get(message.gridId);
    if (!events || !message) return;

    // Execute matching event handlers
    for (const event of events) {
      await this.executeEventHandler(event, message);
    }
  }

  // Execute individual event handler
  async executeEventHandler(event, message) {
    // Check if event matches message
    const isMatch =
      event.eventName === message.eventName &&
      (event.eventParameter === undefined ||
        (event.eventName === 'addOnChange' && event.eventParameter === message.columnName));

    if (!isMatch || !message?.data) return;

    try {
      // Parent Entity
      const parentEntity = message.data.parentEntity;

      // Build table data
      const rows =
        message.data.table?.rows.map((rowData) => {
          const cells = rowData.cells.map((cellData) => new Cell(cellData));
          return new Row(rowData.rowId, cells);
        }) || [];

      const table = new EditableGrid(event.instance, message.gridId, message.parentEntity, rows);

      // Build row data
      const rowCells = message.data.row?.cells.map((cellData) => new Cell(cellData)) || [];
      const row = message.data.row ? new Row(message.data.row.rowId, rowCells) : undefined;

      // Find changed cell
      const cell = rowCells?.find((c) => c.schemaName === message.data?.fieldName);

      // Build event context
      const eventContext = {
        gridId: message.gridId,
        eventName: message.eventName,
        data: { parentEntity, table, row, cell },
      };

      // Execute event function
      await event.eventFunction(event.instance, eventContext);
    } catch (error) {
      // Show error dialog
      parent.Xrm.Navigation.openErrorDialog({
        message: error?.message,
        details: error?.stack,
      });
    } finally {
      // Notify save completion
      if (message.eventName === 'addOnSave') {
        window.top?.postMessage(
          JSON.stringify({
            messageType: 'saveEventCompleted',
            frameId: window.frameElement?.id,
            gridId: message.gridId,
          }),
        );
      }
    }
  }

  // Singleton pattern
  static getServiceBus() {
    if (!ServiceBus._instance) {
      ServiceBus._instance = new ServiceBus();
    }
    return ServiceBus._instance;
  }

  // Get or create event list for grid
  getEventObject(gridId) {
    let events = this._eventList.get(gridId);
    if (!events) {
      this._eventList.set(gridId, []);
      events = this._eventList.get(gridId);
    }
    return events;
  }
}

// ============================================
// EditableGrid Class - Main grid controller
// ============================================
class EditableGrid {
  constructor(instance, gridId, parentEntity, rows) {
    this.instance = instance;
    this.gridId = gridId;
    this.parentEntity = parentEntity;
    this.serviceBus = ServiceBus.getServiceBus();
    this.rows = rows;
  }

  // Set readonly columns state
  setReadOnlyColumns(readOnlyColumns) {
    this.sendMessageRequest('setReadOnlyColumns', readOnlyColumns);
  }

  // Set readonly columns state by row
  setReadOnlyColumnsByRow(rowId, readOnlyColumns) {
    this.sendMessageRequest('setReadOnlyColumnsByRow', {
      rowId: rowId,
      columnNames: readOnlyColumns,
    });
  }

  // Set Row Highlight
  setRowHighlight(rowId, highlight) {
    this.sendMessageRequest('setRowHighlight', { rowId: rowId, highlight: highlight });
  }

  // Set VisibleHiddenColumns
  setVisibleHiddenColumns(visibleHiddenColumns) {
    this.sendMessageRequest('setVisibleHiddenColumns', visibleHiddenColumns);
  }
  // Get parent entity
  getParentEntity() {
    return this.parentEntity;
  }

  // Get all rows
  getRows() {
    return this.rows;
  }

  // Get specific row by ID
  getRow(rowId) {
    return this.rows.find((row) => row.rowId === rowId);
  }

  // Register onLoad event
  addOnLoad(handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnLoad', handler);
    this.sendRequest('addOnLoad');
  }

  removeOnLoad(handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnLoad', handler);
  }

  // Register onNew event
  addOnNew(handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnNew', handler);
    this.sendRequest('addOnNew');
  }

  removeOnNew(handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnNew', handler);
  }

  // Register onNewForm event
  addOnNewForm(handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnNewForm', handler);
    this.sendRequest('addOnNewForm');
  }

  removeOnNewForm(handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnNewForm', handler);
  }

  // Register onQuickView event
  addOnQuickView(handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnQuickView', handler);
    this.sendRequest('addOnQuickView');
  }

  removeOnQuickView(handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnQuickView', handler);
  }

  // Register onChange event
  addOnChange(columnName, handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnChange', handler, columnName);
    this.sendRequest('addOnChange', columnName);
  }

  removeOnChange(columnName, handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnChange', handler, columnName);
  }

  // Register onSave event
  addOnSave(handler) {
    this.serviceBus.subscribe(this.instance, this.gridId, 'addOnSave', handler);
    this.sendRequest('addOnSave');
  }

  removeOnSave(handler) {
    this.serviceBus.unsubscribe(this.gridId, 'addOnSave', handler);
  }

  // Refresh grid data
  refresh() {
    this.sendRequest('refresh');
  }

  // Internal: Send request to parent window
  sendRequest(eventName, columnName) {
    const message = {
      gridId: this.gridId,
      frameId: window.frameElement?.id,
      eventName,
      columnName,
      messageType: 'event',
    };
    window.top?.postMessage(JSON.stringify(message));
  }

  sendMessageRequest(messageType, value, requestId) {
    let message = {
      messageType,
      frameId: window.frameElement?.id || '',
      gridId: this.gridId,
      value: value,
      requestId,
    };

    // Add specific properties based on message type
    if (messageType === 'setReadOnlyColumns') {
      message = { ...message, readOnlyColumns: value };
    } else if (messageType === 'setReadOnlyColumnsByRow') {
      message = { ...message, readOnlyColumnsByRow: value };
    } else if (messageType === 'setRowHighlight') {
      message = { ...message, highlightRow: value };
    } else if (messageType === 'setVisibleHiddenColumns') {
      message = { ...message, visibleHiddenColumns: value };
    }

    window.top?.postMessage(JSON.stringify(message));
  }
}

// ============================================
// Controls Class - Main API entry point
// ============================================
class Controls {
  constructor() {
    this._editableGrids = [];
  }

  // Get editable grid instance
  async getEditableGrid(instance, gridId) {
    await this.waitForGridLoad(gridId);

    return new Promise((resolve, reject) => {
      const message = {
        messageType: 'getEditableGrid',
        frameId: window.frameElement?.id,
        gridId,
      };

      window.top?.postMessage(JSON.stringify(message));

      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.error(
          'Editable grid request timed out. The operation exceeded the 60-second limit.',
        );
        resolve(null);
      }, 60000);

      const messageHandler = (event) => {
        const response = JSON.parse(event.data);

        if (response?.messageType === 'gridReady' && response.controlName === gridId) {
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);

          const payload = response.payload;
          const rows = payload.rows.map((rowData) => {
            const cells = rowData.cells.map((cellData) => new Cell(cellData));
            return new Row(rowData.rowId, cells);
          });

          const grid = new EditableGrid(instance, payload.gridId, payload.parentEntity, rows);

          // Store grid reference
          const gridRef = this._editableGrids.find((g) => g.gridId === gridId);
          if (gridRef) {
            gridRef.grid = grid;
          }

          resolve(grid);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  // Wait for grid to be ready
  waitForGridLoad(gridId) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.gridAlreadyLoaded(gridId)) {
        resolve();
        return;
      }

      // Request grid ready status
      window.top?.postMessage(
        JSON.stringify({
          messageType: 'isStoreReady',
          frameId: window.frameElement?.id,
          gridId,
        }),
      );

      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.error(
          'Editable grid request timed out. The operation exceeded the 60-second limit.',
        );
        resolve(null);
      }, 60000);

      const messageHandler = (event) => {
        const response = JSON.parse(event.data);

        if (response?.messageType === 'storeReady' && response.controlName === gridId) {
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);

          this._editableGrids.push({
            gridId,
            loaded: true,
          });

          resolve();
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  // Check if grid is already loaded
  gridAlreadyLoaded(gridId) {
    return this._editableGrids.some((grid) => grid.loaded && grid.gridId === gridId);
  }
}

// ============================================
// Initialize and Export
// ============================================
const YanaEditableGrid = new Controls();
window.top.YanaEditableGrid = YanaEditableGrid;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { YanaEditableGrid, Controls };
}
