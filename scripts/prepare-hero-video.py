"""Move MP4 metadata before media data for progressive playback, without re-encoding.
Run after replacing public/dkbyggkoncept-vasastan-inflyg.mp4.
"""
from pathlib import Path
import struct

source = Path('public/dkbyggkoncept-vasastan-inflyg.mp4')
target = Path('public/design/hero-background.mp4')
data = source.read_bytes()

def boxes(buf, start=0, end=None):
    end = len(buf) if end is None else end
    while start < end:
        size, kind = struct.unpack_from('>I4s', buf, start)
        header = 8
        if size == 1:
            size = struct.unpack_from('>Q', buf, start + 8)[0]
            header = 16
        elif size == 0:
            size = end - start
        if size < header or start + size > end:
            raise ValueError('Invalid MP4 box')
        yield start, size, kind, header
        start += size

root = list(boxes(data))
assert not any(kind in (b'moof', b'sidx') for _, _, kind, _ in root), 'Fragmented MP4 not supported'
moov_start, moov_size, _, moov_header = next(box for box in root if box[2] == b'moov')
mdat_start, mdat_size, _, mdat_header = next(box for box in root if box[2] == b'mdat')
if moov_start < mdat_start:
    target.write_bytes(data)
else:
    metadata = bytearray(data[moov_start:moov_start + moov_size])
    offsets = []
    def patch(start, end):
        for pos, size, kind, header in boxes(metadata, start, end):
            body = pos + header
            if kind in (b'moov', b'trak', b'mdia', b'minf', b'stbl'):
                patch(body, pos + size)
            elif kind in (b'stco', b'co64'):
                count = struct.unpack_from('>I', metadata, body + 4)[0]
                fmt = '>I' if kind == b'stco' else '>Q'
                step = 4 if kind == b'stco' else 8
                for i in range(count):
                    at = body + 8 + i * step
                    old = struct.unpack_from(fmt, metadata, at)[0]
                    assert mdat_start + mdat_header <= old < mdat_start + mdat_size
                    new = old + moov_size
                    struct.pack_into(fmt, metadata, at, new)
                    offsets.append((old, new))
    patch(0, len(metadata))
    assert offsets, 'No media chunk offsets found'
    output = data[:mdat_start] + metadata + data[mdat_start:moov_start] + data[moov_start + moov_size:]
    for old, new in offsets:
        assert output[new:new + 32] == data[old:old + 32], 'Media offset mismatch'
    assert len(output) == len(data)
    target.write_bytes(output)
print(f'Prepared {target}: {target.stat().st_size:,} bytes; original preserved.')
