results = {
    "deal": set(),
    "instrument": set(),
    "book": set(),
}

results["deal"].update(
    map(
        lambda tup: tuple(tup[0].split("#")),
        indicative.results["deal"]["dealindicatives"],
    )
)
