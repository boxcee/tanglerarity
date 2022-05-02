const calculator = (properties, spec): number => {
    const {total, properties: rarities} = spec;
    return Object.keys(properties).reduce((acc, property) => {
        const {label, value}: { label: string, value: string } = properties[property];
        if (rarities[label.toLowerCase()] && rarities[label.toLowerCase()][value.toLowerCase()]) {
            return acc + 1 / ((rarities[label.toLowerCase()][value.toLowerCase()] * total) / total);
        }
        return acc;
    }, 0);
};

export default calculator;
