-- 중복 항목 확인
SELECT videoId, COUNT(*) as count
FROM videos
GROUP BY videoId
HAVING count > 1;

-- 중복 항목 중 하나만 남기고 삭제
DELETE FROM videos 
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM videos
    GROUP BY videoId
);