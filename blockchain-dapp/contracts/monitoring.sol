// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract Monitoring {
    address public owner;

    struct DataPoint {
        uint256 timestamp;
        int256 temperature;
        int256 humidity;
    }

    struct Shipment {
        string shipmentId;
        address buyerAddress;
        string description;
        bool isActive;
    }

    mapping(string => DataPoint[]) public dataByShipmentId;
    mapping(address => string[]) public shipmentsForBuyer;
    mapping(string => Shipment) public shipmentDetails;

    event ShipmentRegistered(string indexed shipmentId, address indexed buyerAddress, string description);
    event DataPointAdded(string indexed shipmentId, uint256 timestamp, int256 temperature, int256 humidity);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya admin (pemilik contract) yang bisa menjalankan fungsi ini.");
        _;
    }

    function registerShipment(
        string memory _shipmentId,
        address _buyerAddress,
        string memory _description
    ) public onlyOwner {
        require(shipmentDetails[_shipmentId].buyerAddress == address(0), "ID Pengiriman sudah ada.");
        shipmentDetails[_shipmentId] = Shipment({
            shipmentId: _shipmentId,
            buyerAddress: _buyerAddress,
            description: _description,
            isActive: true
        });
        shipmentsForBuyer[_buyerAddress].push(_shipmentId);
        emit ShipmentRegistered(_shipmentId, _buyerAddress, _description);
    }

    function addDataPoint(
        string memory _shipmentId,
        uint256 _timestamp,
        int256 _temperature,
        int256 _humidity
    ) public onlyOwner {
        require(shipmentDetails[_shipmentId].isActive, "Pengiriman ini sudah tidak aktif.");
        dataByShipmentId[_shipmentId].push(
            DataPoint({
                timestamp: _timestamp,
                temperature: _temperature,
                humidity: _humidity
            })
        );
        emit DataPointAdded(_shipmentId, _timestamp, _temperature, _humidity);
    }

    function getLatestDataPoint(string memory _shipmentId) public view returns (DataPoint memory) {
        DataPoint[] storage dataPoints = dataByShipmentId[_shipmentId];
        require(dataPoints.length > 0, "Belum ada data untuk pengiriman ini.");
        return dataPoints[dataPoints.length - 1];
    }
/**
     * @dev Fungsi kustom untuk mendapatkan seluruh array ID pengiriman milik seorang pembeli.
     */
    function getShipmentsForBuyer(address _buyerAddress) public view returns (string[] memory) {
        return shipmentsForBuyer[_buyerAddress];
    }
    function getShipmentHistory(string memory _shipmentId) public view returns (DataPoint[] memory) {
        return dataByShipmentId[_shipmentId];
    }
}